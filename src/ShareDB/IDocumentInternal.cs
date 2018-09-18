using Newtonsoft.Json.Linq;

namespace ShareDB
{
    internal interface IDocumentInternal
    {
        string Collection { get; }
        string Id { get; }
        int Version { get; }
        IOTType Type { get; }

        void HandleFetch(ShareDBException ex, int version, string type, JToken ops);
        void HandleOp(ShareDBException ex, int version, int seq);
    }
}
