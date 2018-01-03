using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ShareDB.RichText
{
    public class Delta
    {
        private static readonly Lazy<DeltaEqualityComparer> _equalityComparer = new Lazy<DeltaEqualityComparer>();
        public static DeltaEqualityComparer EqualityComparer => _equalityComparer.Value;

        public const string InsertType = "insert";
        public const string DeleteType = "delete";
        public const string RetainType = "retain";
        public const string Attributes = "attributes";

        public static Delta New()
        {
            return new Delta();
        }

        private readonly List<JToken> _ops;

        public Delta()
        {
            _ops = new List<JToken>();
        }

        public Delta(IEnumerable<JToken> ops)
        {
            _ops = ops.ToList();
        }

        public Delta(Delta delta)
        {
            _ops = delta._ops.Select(op => op.DeepClone()).ToList();
        }

        public IReadOnlyList<JToken> Ops => _ops;

        public Delta Insert(JToken text, JToken attributes = null)
        {
            if (text.Type == JTokenType.String && ((string) text).Length == 0)
                return this;

            var newOp = new JObject(new JProperty(InsertType, text));
            if (attributes != null && attributes.HasValues)
                newOp[Attributes] = attributes;

            return Add(newOp);
        }

        public Delta Delete(int length)
        {
            if (length <= 0)
                return this;

            return Add(new JObject(new JProperty(DeleteType, length)));
        }

        public Delta Retain(int length, JToken attributes = null)
        {
            if (length <= 0)
                return this;

            var newOp = new JObject(new JProperty(RetainType, length));
            if (attributes != null && attributes.HasValues)
                newOp[Attributes] = attributes;

            return Add(newOp);
        }

        public Delta Chop()
        {
            JToken lastOp = _ops.Count == 0 ? null : _ops[_ops.Count - 1];
            if (lastOp != null && lastOp[RetainType] != null && lastOp[Attributes] == null)
                _ops.RemoveAt(_ops.Count - 1);
            return this;
        }

        public Delta Compose(Delta other)
        {
            var thisIter = new OpIterator(_ops);
            var otherIter = new OpIterator(other._ops);
            var delta = new Delta();
            while (thisIter.HasNext() || otherIter.HasNext())
            {
                if (otherIter.PeekType() == InsertType)
                {
                    delta.Add(otherIter.Next());
                }
                else if (thisIter.PeekType() == DeleteType)
                {
                    delta.Add(thisIter.Next());
                }
                else
                {
                    int length = Math.Min(thisIter.PeekLength(), otherIter.PeekLength());
                    JToken thisOp = thisIter.Next(length);
                    JToken otherOp = otherIter.Next(length);
                    if (otherOp.OpType() == RetainType)
                    {
                        var newOp = new JObject();
                        if (thisOp.OpType() == RetainType)
                            newOp[RetainType] = length;
                        else
                            newOp[InsertType] = thisOp[InsertType];

                        JToken attributes = ComposeAttributes(thisOp[Attributes], otherOp[Attributes],
                            thisOp.OpType() == RetainType);
                        if (attributes != null)
                            newOp[Attributes] = attributes;
                        delta.Add(newOp);
                    }
                    else if (otherOp.OpType() == DeleteType && thisOp.OpType() == RetainType)
                    {
                        delta.Add(otherOp);
                    }
                }
            }
            return delta.Chop();
        }

        public int GetLength()
        {
            return _ops.Sum(op => op.OpLength());
        }

        public bool DeepEquals(Delta other)
        {
            return _ops.SequenceEqual(other._ops, JToken.EqualityComparer);
        }

        private Delta Add(JToken newOp)
        {
            int index = _ops.Count;
            JToken lastOp = _ops.Count == 0 ? null : _ops[_ops.Count - 1];
            newOp = (JObject) newOp.DeepClone();
            if (lastOp != null && lastOp.Type == JTokenType.Object)
            {
                if (newOp.OpType() == DeleteType && lastOp.OpType() == DeleteType)
                {
                    int delete = (int) lastOp[DeleteType] + (int) newOp[DeleteType];
                    _ops[index - 1] = new JObject(new JProperty(DeleteType, delete));
                    return this;
                }

                if (lastOp.OpType() == DeleteType && newOp.OpType() == InsertType)
                {
                    index -= 1;
                    lastOp = index == 0 ? null : _ops[index - 1];
                    if (lastOp?.Type != JTokenType.Object)
                    {
                        _ops.Insert(0, newOp);
                        return this;
                    }
                }

                if (JToken.DeepEquals(newOp[Attributes], lastOp[Attributes]))
                {
                    if (newOp[InsertType]?.Type == JTokenType.String && lastOp[InsertType]?.Type == JTokenType.String)
                    {
                        string insert = (string) lastOp[InsertType] + (string) newOp[InsertType];
                        var op = new JObject(new JProperty(InsertType, insert));
                        if (newOp[Attributes]?.Type == JTokenType.Object)
                            op[Attributes] = newOp[Attributes];
                        _ops[index - 1] = op;
                        return this;
                    }
                    else if (newOp.OpType() == RetainType && lastOp.OpType() == RetainType)
                    {
                        int retain = (int) lastOp[RetainType] + (int) newOp[RetainType];
                        var op = new JObject(new JProperty(RetainType, retain));
                        if (newOp[Attributes]?.Type == JTokenType.Object)
                            op[Attributes] = newOp[Attributes];
                        _ops[index - 1] = op;
                        return this;
                    }
                }
            }

            _ops.Insert(index, newOp);
            return this;
        }

        private static JToken ComposeAttributes(JToken a, JToken b, bool keepNull)
        {
            JObject aObj = a?.Type == JTokenType.Object ? (JObject) a : new JObject();
            JObject bObj = b?.Type == JTokenType.Object ? (JObject) b : new JObject();
            JObject attributes = (JObject) bObj.DeepClone();
            if (!keepNull)
                attributes = new JObject(attributes.Properties().Where(p => p.Value.Type != JTokenType.Null));

            foreach (JProperty prop in aObj.Properties())
            {
                if (aObj[prop.Name] != null && bObj[prop.Name] == null)
                    attributes.Add(prop);
            }

            return attributes.HasValues ? attributes : null;
        }

        private class OpIterator
        {
            private readonly IReadOnlyList<JToken> _ops;
            private int _index;
            private int _offset;

            public OpIterator(IReadOnlyList<JToken> ops)
            {
                _ops = ops;
            }

            public bool HasNext()
            {
                return PeekLength() < int.MaxValue;
            }

            public JToken Next(int length = int.MaxValue)
            {
                if (_index >= _ops.Count)
                    return new JObject(new JProperty(RetainType, int.MaxValue));

                JToken nextOp = _ops[_index];
                int offset = _offset;
                int opLength = nextOp.OpLength();
                if (length >= opLength - offset)
                {
                    length = opLength - offset;
                    _index++;
                    _offset = 0;
                }
                else
                {
                    _offset += length;
                }

                if (nextOp.OpType() == DeleteType)
                    return new JObject(new JProperty(DeleteType, length));

                var retOp = new JObject();
                if (nextOp[Attributes] != null)
                    retOp[Attributes] = nextOp[Attributes];
                if (nextOp.OpType() == RetainType)
                    retOp[RetainType] = length;
                else if (nextOp[InsertType]?.Type == JTokenType.String)
                    retOp[InsertType] = ((string) nextOp[InsertType]).Substring(offset, length);
                else
                    retOp[InsertType] = nextOp[InsertType];
                return retOp;
            }

            public JToken Peek()
            {
                return _index >= _ops.Count ? null : _ops[_index];
            }

            public int PeekLength()
            {
                if (_index >= _ops.Count)
                    return int.MaxValue;
                return _ops[_index].OpLength() - _offset;
            }

            public string PeekType()
            {
                if (_index >= _ops.Count)
                    return RetainType;

                JToken nextOp = _ops[_index];
                return nextOp.OpType();
            }
        }
    }
}
