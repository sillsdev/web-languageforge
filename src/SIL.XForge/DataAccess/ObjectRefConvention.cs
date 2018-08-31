using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Bson;

namespace SIL.XForge.DataAccess
{
    public class ObjectRefConvention : ConventionBase, IMemberMapConvention
    {
        public void Apply(BsonMemberMap memberMap)
        {
            if (memberMap.MemberName.EndsWith("Ref"))
                memberMap.SetSerializer(new StringSerializer(BsonType.ObjectId));
        }
    }
}
