using System;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization.Conventions;

namespace SIL.XForge.DataAccess
{
    public class SingleDiscriminatorConvention : IDiscriminatorConvention
    {
        private readonly Type _actualType;

        public SingleDiscriminatorConvention(Type actualType)
        {
            _actualType = actualType;
        }

        public string ElementName => null;

        public Type GetActualType(IBsonReader bsonReader, Type nominalType)
        {
            return _actualType;
        }

        public BsonValue GetDiscriminator(Type nominalType, Type actualType)
        {
            return null;
        }
    }
}
