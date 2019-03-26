using System;
using Newtonsoft.Json.Linq;

namespace ShareDB.Json0
{
    public class Json0OTType : IOTType
    {
        public static Json0OTType Instance { get; } = new Json0OTType();

        private Json0OTType()
        {
        }

        public string Name => "json0";
        public Uri Uri => new Uri("http://sharejs.org/types/JSONv0");
        public Type DataType => typeof(JToken);

        public object Apply(object snapshot, JToken op)
        {
            throw new NotImplementedException();
        }

        public JToken Compose(JToken op1, JToken op2)
        {
            throw new NotImplementedException();
        }

        public object Deserialize(JToken ops)
        {
            return ops;
        }

        public JToken Serialize(object data)
        {
            return (JToken)data;
        }
    }
}
