using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace SIL.XForge.DataAccess
{
    public class EmptyStringBooleanSerializer : BooleanSerializer
    {
        public override bool Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
        {
            IBsonReader bsonReader = context.Reader;
            BsonType bsonType = bsonReader.GetCurrentBsonType();
            if (bsonType == BsonType.String)
            {
                string value = bsonReader.ReadString().ToLower();
                if (value == "")
                    return false;
                return JsonConvert.ToBoolean(bsonReader.ReadString().ToLower());
            }
            return base.Deserialize(context, args);
        }
    }
}
