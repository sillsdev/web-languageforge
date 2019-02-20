using System;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;

namespace SIL.XForge.DataAccess
{
    public static class DataAccessClassMap
    {
        public static void RegisterConventions(string nspace, params IConvention[] conventions)
        {
            var conventionPack = new ConventionPack();
            conventionPack.AddRange(conventions);
            ConventionRegistry.Register(nspace, conventionPack, t => t.Namespace.StartsWith(nspace));
        }

        public static void RegisterClass<T>(Action<BsonClassMap<T>> mapSetup)
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
            {
                cm.AutoMap();
                mapSetup?.Invoke(cm);
            });
        }

        public static void RegisterConcreteClass<TBase, TConcrete>()
        {
            BsonSerializer.RegisterDiscriminatorConvention(typeof(TBase),
                new SingleDiscriminatorConvention(typeof(TConcrete)));
            BsonClassMap.RegisterClassMap<TConcrete>();
        }
    }
}
