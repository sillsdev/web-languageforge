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

            RegisterClass<Entity>(cm =>
                {
                    cm.MapIdProperty(e => e.Id)
                        .SetIdGenerator(StringObjectIdGenerator.Instance)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });

            RegisterClass<ProjectUserEntity>(cm =>
                {
                    cm.SetIdMember(null);
                    cm.MapProperty(u => u.Id).SetSerializer(new StringSerializer(BsonType.ObjectId));
                    cm.UnmapProperty(u => u.ProjectRef);
                });

            var client = new MongoClient(options.ConnectionString);
            services.AddSingleton<IMongoClient>(sp => client);

            services.AddMongoRepository<UserEntity>(options.MongoDatabaseName, "users",
                mapSetup: cm =>
                {
                    var customSitesSerializer =
                        new DictionaryInterfaceImplementerSerializer<Dictionary<string, Site>>(
                            DictionaryRepresentation.Document, new SiteDomainSerializer(),
                            BsonSerializer.SerializerRegistry.GetSerializer<Site>());
                    cm.GetMemberMap(u => u.Sites).SetSerializer(customSitesSerializer);
                },
                indexSetup: indexes =>
                {
                    IndexKeysDefinitionBuilder<UserEntity> builder = Builders<UserEntity>.IndexKeys;
                    indexes.CreateOrUpdate(new CreateIndexModel<UserEntity>(builder.Ascending(u => u.CanonicalEmail),
                        new CreateIndexOptions { Unique = true }));
                    indexes.CreateOrUpdate(new CreateIndexModel<UserEntity>(builder.Ascending(u => u.Username),
                        new CreateIndexOptions<UserEntity>
                            {
                                Unique = true,
                                PartialFilterExpression = Builders<UserEntity>.Filter.Exists(u => u.Username)
                            }));
                });

            return services;
        }

        public static void AddMongoRepository<T>(this IServiceCollection services, string databaseName,
            string collectionName, Action<BsonClassMap<T>> mapSetup = null,
            Action<IMongoIndexManager<T>> indexSetup = null) where T : Entity
        {
            RegisterClass(mapSetup);
            services.AddSingleton(sp => CreateRepository<T>(sp.GetService<IMongoClient>(), databaseName,
                collectionName, indexSetup));
        }

        private static void RegisterClass<T>(Action<BsonClassMap<T>> mapSetup)
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
                {
                    cm.AutoMap();
                    mapSetup?.Invoke(cm);
                });
        }

        private static IRepository<T> CreateRepository<T>(IMongoClient mongoClient, string databaseName,
            string collectionName, Action<IMongoIndexManager<T>> indexSetup) where T : Entity
        {
            IMongoCollection<T> collection = mongoClient.GetDatabase(databaseName).GetCollection<T>(collectionName);
            indexSetup?.Invoke(collection.Indexes);
            return new MongoRepository<T>(collection);
        }
    }
}
