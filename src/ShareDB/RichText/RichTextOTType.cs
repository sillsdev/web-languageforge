using System;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

namespace ShareDB.RichText
{
    public class RichTextOTType : IOTType
    {
        public static RichTextOTType Instance { get; } = new RichTextOTType();

        private RichTextOTType()
        {
        }

        public string Name => "rich-text";
        public Uri Uri => new Uri("http://sharejs.org/types/rich-text/v1");
        public Type DataType => typeof(Delta);

        public object Apply(object snapshot, JToken op)
        {
            var snapshotDelta = new Delta((Delta)snapshot);
            Delta opDelta = DeserializeDelta(op);
            return snapshotDelta.Compose(opDelta);
        }

        public JToken Compose(JToken op1, JToken op2)
        {
            Delta delta1 = DeserializeDelta(op1);
            Delta delta2 = DeserializeDelta(op2);
            delta1.Compose(delta2);
            return SerializeDelta(delta1);
        }

        public JToken Serialize(object data)
        {
            return SerializeDelta((Delta)data);
        }

        public object Deserialize(JToken ops)
        {
            return DeserializeDelta(ops);
        }

        private static JToken SerializeDelta(Delta delta)
        {
            return new JObject(new JProperty("ops", new JArray(delta.Ops)));
        }

        private static Delta DeserializeDelta(JToken ops)
        {
            IEnumerable<JToken> opsEnum;
            if (ops.Type == JTokenType.Array)
                opsEnum = ops.Children();
            else if (ops["ops"]?.Type == JTokenType.Array)
                opsEnum = ops["ops"].Children();
            else
                opsEnum = Enumerable.Empty<JToken>();
            return new Delta(opsEnum);
        }
    }
}
