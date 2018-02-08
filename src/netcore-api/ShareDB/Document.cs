using Newtonsoft.Json.Linq;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShareDB
{
    public class Document<T> : IDocumentInternal
    {
        private readonly ConcurrentQueue<TaskCompletionSource<bool>> _inflightFetches;
        private TaskCompletionSource<bool> _inflightOp;
        private OpInfo _inflightOpInfo;

        internal Document(Connection conn, string collection, string id, IOTType type = null)
        {
            _inflightFetches = new ConcurrentQueue<TaskCompletionSource<bool>>();

            Connection = conn;
            Collection = collection;
            Id = id;
            Version = -1;
            Type = type;
        }

        public Connection Connection { get; }
        public string Collection { get; }
        public string Id { get; }
        public int Version { get; private set; }
        public IOTType Type { get; private set; }
        public T Data { get; private set; }
        public bool IsLoaded { get; private set; }

        public Task<bool> CreateAsync(T op)
        {
            if (IsLoaded)
                throw new ShareDBException("Document already loaded.", 4016);

            return SubmitAsync(OpMessageType.Create, op);
        }

        public Task<bool> CreateAsync(IEnumerable<T> ops)
        {
            if (IsLoaded)
                throw new ShareDBException("Document already loaded.", 4016);

            return SubmitAsync(OpMessageType.Create, ops);
        }

        public async Task<bool> FetchAsync()
        {
            var tcs = new TaskCompletionSource<bool>();
            _inflightFetches.Enqueue(tcs);
            await Connection.SendFetchAsync(this);
            return await tcs.Task;
        }

        public Task<bool> SubmitOpAsync(T op)
        {
            if (!IsLoaded)
                throw new ShareDBException("Document not loaded.", 4015);

            return SubmitAsync(OpMessageType.Op, op);
        }

        public Task<bool> SubmitOpsAsync(IEnumerable<T> ops)
        {
            if (!IsLoaded)
                throw new ShareDBException("Document not loaded.", 4015);

            return SubmitAsync(OpMessageType.Op, ops);
        }

        public Task<bool> DeleteAsync()
        {
            if (!IsLoaded)
                throw new ShareDBException("Document not loaded.", 4015);

            return SubmitAsync(OpMessageType.Delete, Enumerable.Empty<T>());
        }

        private Task<bool> SubmitAsync(OpMessageType msgType, T op)
        {
            return SubmitAsync(msgType, new[] { op });
        }

        private async Task<bool> SubmitAsync(OpMessageType msgType, IEnumerable<T> ops)
        {
            // compose all of the ops into one op
            JToken composedOp = null;
            foreach (T op in ops)
            {
                JToken serializedOp = Type.Serialize(op);
                composedOp = composedOp != null ? Type.Compose(composedOp, serializedOp) : serializedOp;
            }

            // make sure that the last submit has completed
            if (_inflightOp != null)
                await _inflightOp.Task;

            // send op to server
            _inflightOp = new TaskCompletionSource<bool>();
            int seq = Connection.NextSeq();
            _inflightOpInfo = new OpInfo(msgType, seq, composedOp);
            await Connection.SendOpAsync(this, msgType, seq, composedOp);
            return await _inflightOp.Task;
        }

        void IDocumentInternal.HandleFetch(ShareDBException ex, int version, string type, JToken ops)
        {
            if (!_inflightFetches.TryDequeue(out TaskCompletionSource<bool> tcs))
                return;

            if (ex != null)
            {
                tcs.SetException(ex);
            }
            else
            {
                IOTType otType = null;
                if (type != null && !OTTypes.TryGetType(type, out otType))
                    tcs.SetException(new ShareDBException($"Unregistered type {type}.", 4008));
                if (Type == null)
                    Type = otType;

                if (otType != null && Type != otType)
                {
                    tcs.SetException(new ShareDBException("The document type does not match the retrieved data type.",
                        4101));
                }
                else
                {
                    Version = version;
                    if (ops != null)
                    {
                        Data = (T) Type.Deserialize(ops);
                        IsLoaded = true;
                        tcs.SetResult(true);
                    }
                    else
                    {
                        tcs.SetResult(false);
                    }
                }
            }
        }

        void IDocumentInternal.HandleOp(ShareDBException ex, int version, int seq)
        {
            OpInfo opInfo = _inflightOpInfo;
            _inflightOpInfo = null;
            if (ex != null)
            {
                if (ex.Code == 4002)
                    _inflightOp.SetResult(false);
                else
                    _inflightOp.SetException(ex);
            }
            else if (seq != opInfo.Seq || (opInfo.MessageType != OpMessageType.Create && version != Version))
            {
                _inflightOp.SetException(new ShareDBException("Received incorrect op acknowledgement.", 4100));
            }
            else
            {
                switch (opInfo.MessageType)
                {
                    case OpMessageType.Create:
                        Version = version;
                        Data = (T) Type.Deserialize(opInfo.Op);
                        IsLoaded = true;
                        break;

                    case OpMessageType.Op:
                        Data = (T) Type.Apply(Data, opInfo.Op);
                        IsLoaded = true;
                        break;

                    case OpMessageType.Delete:
                        Data = default(T);
                        IsLoaded = false;
                        break;
                }

                Version++;
                _inflightOp.SetResult(true);
            }
        }

        private class OpInfo
        {
            public OpInfo(OpMessageType msgType, int seq, JToken op)
            {
                MessageType = msgType;
                Seq = seq;
                Op = op;
            }

            public OpMessageType MessageType { get; }
            public int Seq { get; }
            public JToken Op { get; }
        }
    }
}
