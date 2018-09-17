using System;
using System.Collections.Generic;
using Hangfire;
using Hangfire.Mongo;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Options;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public static class DataAccessServiceCollectionExtensions
    {
        public static IServiceCollection AddDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<DataAccessOptions>(configuration.GetSection("DataAccess"));
            DataAccessOptions options = configuration.GetDataAccessOptions();
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
                new ObjectRefConvention()
            };
            ConventionRegistry.Register("Global", globalPack, t => true);
            var paratextProjectPack = new ConventionPack { new NoIdMemberConvention() };
            ConventionRegistry.Register("ParatextProject", paratextProjectPack, t => t == typeof(ParatextProject));

            RegisterClass<Entity>(cm =>
                {
                    cm.MapIdProperty(e => e.Id)
                        .SetIdGenerator(StringObjectIdGenerator.Instance)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    cm.MapMember(e => e.OwnerRef)
                        .SetShouldSerializeMethod(e => e.GetType() != typeof(UserEntity));
                });

            RegisterClass<ProjectDataEntity>(cm =>
                {
                    cm.MapMember(p => p.ProjectRef)
                        .SetShouldSerializeMethod(p => p.GetType() != typeof(ProjectEntity));
                });

            services.AddSingleton<IMongoClient>(sp => new MongoClient(options.ConnectionString));

            services.AddMongoRepository<UserEntity>(options.MongoDatabaseName, "users", cm =>
                {
                    cm.MapMember(u => u.SiteRole).SetSerializer(
                        new DictionaryInterfaceImplementerSerializer<Dictionary<string, string>>(
                            DictionaryRepresentation.Document, new SiteDomainSerializer(), new StringSerializer()));
                    cm.MapMember(u => u.Projects)
                        .SetSerializer(new EnumerableInterfaceImplementerSerializer<List<string>, string>(
                            new StringSerializer(BsonType.ObjectId)));
                });
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
