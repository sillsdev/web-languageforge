using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization;
using MongoDB.Bson;

namespace SIL.XForge.DataAccess
{
    public class SiteDomainSerializer : StringSerializer
    {
        private static readonly string DotReplacer = "___DOT___";

        public static string ConvertDotIn(string value)
        {
            return value.Replace(".", DotReplacer);
        }

        protected override string DeserializeValue(BsonDeserializationContext context, BsonDeserializationArgs args)
        {
            string value = base.DeserializeValue(context, args);
            return value.Replace(DotReplacer, ".");
        }

        protected override void SerializeValue(BsonSerializationContext context, BsonSerializationArgs args,
            string value)
        {
            base.SerializeValue(context, args, ConvertDotIn(value));
        }
    }
}
