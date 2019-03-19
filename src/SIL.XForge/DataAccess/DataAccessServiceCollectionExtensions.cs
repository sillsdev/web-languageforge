using System;
using System.Collections.Generic;
using Hangfire;
using Hangfire.Mongo;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Options;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace Microsoft.Extensions.DependencyInjection
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

            DataAccessClassMap.RegisterConventions("SIL.XForge",
                new CamelCaseElementNameConvention(),
                new ObjectRefConvention(),
                new EnumRepresentationConvention(BsonType.String),
                new IgnoreIfDefaultConvention(true));

            DataAccessClassMap.RegisterClass<Entity>(cm =>
            {
                cm.MapIdProperty(e => e.Id)
                    .SetIdGenerator(StringObjectIdGenerator.Instance)
                    .SetSerializer(new StringSerializer(BsonType.ObjectId));
            });

            DataAccessClassMap.RegisterClass<ProjectUserEntity>(cm =>
            {
                cm.SetIdMember(null);
                cm.MapProperty(u => u.Id).SetSerializer(new StringSerializer(BsonType.ObjectId));
                cm.UnmapProperty(u => u.ProjectRef);
            });

            services.AddSingleton<IMongoClient>(sp => new MongoClient(options.ConnectionString));
            services.AddSingleton<IMongoDatabase>(
                sp => sp.GetService<IMongoClient>().GetDatabase(options.MongoDatabaseName));

            services.AddMongoRepository<UserEntity>("users",
                mapSetup: cm =>
                {
                    var customSitesSerializer =
                        new DictionaryInterfaceImplementerSerializer<Dictionary<string, Site>>(
                            DictionaryRepresentation.Document, new DictionaryKeySerializer(),
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

        public static void AddMongoRepository<T>(this IServiceCollection services, string collectionName,
            Action<BsonClassMap<T>> mapSetup = null, Action<IMongoIndexManager<T>> indexSetup = null) where T : Entity
        {
            DataAccessClassMap.RegisterClass(mapSetup);
            services.AddSingleton<IRepository<T>>(sp => new MongoRepository<T>(
                sp.GetService<IMongoDatabase>().GetCollection<T>(collectionName), c => indexSetup?.Invoke(c.Indexes)));
        }
    }
}
