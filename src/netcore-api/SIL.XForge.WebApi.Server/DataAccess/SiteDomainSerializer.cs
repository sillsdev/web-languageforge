using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson.Serialization;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public class SiteDomainSerializer : StringSerializer
    {
        protected override string DeserializeValue(BsonDeserializationContext context, BsonDeserializationArgs args)
        {
            string value = base.DeserializeValue(context, args);
            return value.Replace("___DOT___", ".");
        }

        protected override void SerializeValue(BsonSerializationContext context, BsonSerializationArgs args,
            string value)
        {
            value = value.Replace(".", "___DOT___");
            base.SerializeValue(context, args, value);
        }
    }
}
