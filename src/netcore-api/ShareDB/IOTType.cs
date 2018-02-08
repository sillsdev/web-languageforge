using Newtonsoft.Json.Linq;
using System;

namespace ShareDB
{
    public interface IOTType
    {
        string Name { get; }
        Uri Uri { get; }
        Type DataType { get; }

        object Apply(object snapshot, JToken op);
        JToken Compose(JToken op1, JToken op2);
        JToken Serialize(object data);
        object Deserialize(JToken ops);
    }
}
