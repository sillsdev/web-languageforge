using System;
using Hangfire;
using Hangfire.Mongo;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using SIL.XForge.Configuration;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public static class DataAccessServiceCollectionExtensions
    {
        public static IServiceCollection AddDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            var options = configuration.GetOptions<DataAccessOptions>();
            services.AddHangfire(x => x.UseMongoStorage(options.ConnectionString, options.JobDatabase,
                new MongoStorageOptions
                {
                    MigrationOptions = new MongoMigrationOptions
                    {
                        Strategy = MongoMigrationStrategy.Migrate
                    }
                }));

            var globalPack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new ObjectRefConvention(),
                new IgnoreIfNullConvention(true)
            };
            ConventionRegistry.Register("Global", globalPack, t => true);
            var paratextProjectPack = new ConventionPack { new NoIdMemberConvention() };
            ConventionRegistry.Register("ParatextProject", paratextProjectPack, t => t == typeof(ParatextProject));

            RegisterClass<Entity>(cm =>
                {
                    cm.MapIdProperty(e => e.Id)
                        .SetIdGenerator(StringObjectIdGenerator.Instance)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });

            services.AddSingleton<IMongoClient>(sp => new MongoClient(options.ConnectionString));

            services.AddMongoRepository<UserEntity>(options.MongoDatabaseName, "users");
            return services;
        }

        public static void AddMongoRepository<T>(this IServiceCollection services, string databaseName,
            string collectionName, Action<BsonClassMap<T>> setup = null) where T : Entity
        {
            RegisterClass(setup);
            services.AddSingleton(sp => CreateRepository<T>(sp.GetService<IMongoClient>(), databaseName,
                collectionName));
        }

        private static void RegisterClass<T>(Action<BsonClassMap<T>> setup = null)
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
                {
                    cm.AutoMap();
                    setup?.Invoke(cm);
                });
        }

        private static IRepository<T> CreateRepository<T>(IMongoClient mongoClient, string databaseName,
            string collectionName) where T : Entity
        {
            return new MongoRepository<T>(mongoClient.GetDatabase(databaseName)
                .GetCollection<T>(collectionName));
        }
    }
}
