using Newtonsoft.Json.Linq;

namespace ShareDB.RichText
{
    public static class OpExtensions
    {
        public static string OpType(this JToken op)
        {
            if (op[Delta.DeleteType]?.Type == JTokenType.Integer)
                return Delta.DeleteType;
            if (op[Delta.RetainType]?.Type == JTokenType.Integer)
                return Delta.RetainType;
            return Delta.InsertType;
        }

        public static int OpLength(this JToken op)
        {
            if (op[Delta.DeleteType]?.Type == JTokenType.Integer)
                return (int) op[Delta.DeleteType];
            if (op[Delta.RetainType]?.Type == JTokenType.Integer)
                return (int) op[Delta.RetainType];
            if (op[Delta.InsertType]?.Type == JTokenType.String)
                return ((string) op[Delta.InsertType]).Length;
            return 1;
        }
    }
}
