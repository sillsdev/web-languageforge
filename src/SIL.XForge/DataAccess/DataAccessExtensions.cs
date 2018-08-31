using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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
using MongoDB.Driver.Linq;
using SIL.XForge.Models;
using SIL.XForge.Models.SFChecks;
using SIL.XForge.Models.Translate;
using SIL.XForge.Utils;

namespace SIL.XForge.DataAccess
{
    public static class DataAccessExtensions
    {
        public static Task<T> UpdateAsync<T>(this IRepository<T> repo, T entity,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false) where T : IEntity
        {
            return repo.UpdateAsync(e => e.Id == entity.Id, update, upsert);
        }

        public static async Task<T> DeleteAsync<T>(this IRepository<T> repo, string id) where T : IEntity
        {
            return await repo.DeleteAsync(e => e.Id == id);
        }

        public static async Task<T> GetAsync<T>(this IRepository<T> repo, string id) where T : IEntity
        {
            Attempt<T> attempt = await repo.TryGetAsync(id);
            if (attempt.Success)
                return attempt.Result;
            return default(T);
        }

        public static async Task<IReadOnlyList<T>> GetAllAsync<T>(this IRepository<T> repo) where T : IEntity
        {
            return await repo.Query().ToListAsync();
        }

        public static async Task<Attempt<T>> TryGetAsync<T>(this IRepository<T> repo, string id) where T : IEntity
        {
            T entity = await repo.Query().Where(e => e.Id == id).FirstOrDefaultAsync();
            return new Attempt<T>(entity != null, entity);
        }

        public static async Task<List<TResult>> ToListAsync<TSource, TResult>(this IMongoQueryable<TSource> query,
            Func<TSource, Task<TResult>> selector)
        {
            var results = new List<TResult>();
            using (IAsyncCursor<TSource> cursor = await query.ToCursorAsync())
            {
                while (await cursor.MoveNextAsync())
                {
                    foreach (TSource entity in cursor.Current)
                        results.Add(await selector(entity));
                }
            }
            return results;
        }

        public static Task<List<TResult>> ToListAsync<TSource, TResult>(this IMongoQueryable<TSource> query,
            Func<TSource, TResult> selector)
        {
            return query.ToListAsync(e => Task.FromResult(selector(e)));
        }

        public static IServiceCollection AddMongoDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            IConfigurationSection dataAccessConfig = configuration.GetSection("DataAccess");
            string connectionString = dataAccessConfig.GetValue("ConnectionString",
                "mongodb://localhost:27017");
            string jobDatabase = dataAccessConfig.GetValue("JobDatabase", "jobs");
            services.AddHangfire(x => x.UseMongoStorage(connectionString, jobDatabase,
                new MongoStorageOptions
                {
                    MigrationOptions = new MongoMigrationOptions
                    {
                        Strategy = MongoMigrationStrategy.Migrate
                    }
                }));

            BsonSerializer.RegisterDiscriminatorConvention(typeof(ProjectEntity),
                new HierarchicalDiscriminatorConvention("appName"));

            var globalPack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new ObjectRefConvention()
            };
            ConventionRegistry.Register("Global", globalPack, t => true);
            var paratextProjectPack = new ConventionPack { new NoIdMemberConvention() };
            ConventionRegistry.Register("ParatextProject", paratextProjectPack, t => t == typeof(ParatextProject));

            RegisterClass<EntityBase>(cm =>
                {
                    cm.MapIdProperty(e => e.Id)
                        .SetIdGenerator(StringObjectIdGenerator.Instance)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });

            services.AddSingleton<IMongoClient>(sp => new MongoClient(connectionString));

            services.AddMongoRepository<UserEntity>("users", cm =>
                {
                    cm.MapMember(u => u.SiteRole).SetSerializer(
                        new DictionaryInterfaceImplementerSerializer<Dictionary<string, string>>(
                            DictionaryRepresentation.Document, new SiteDomainSerializer(), new StringSerializer()));
                    cm.MapMember(u => u.Projects)
                        .SetSerializer(new EnumerableInterfaceImplementerSerializer<List<string>, string>(
                            new StringSerializer(BsonType.ObjectId)));
                });

            services.AddMongoRepository<ProjectEntity>("projects");
            services.AddMongoRepository<TranslateProjectEntity>("projects", cm => cm.SetDiscriminator("translate"));
            services.AddMongoRepository<SFChecksProjectEntity>("projects", cm => cm.SetDiscriminator("sfchecks"));
            return services;
        }

        private static void AddMongoRepository<T>(this IServiceCollection services, string collectionName,
            Action<BsonClassMap<T>> setup = null) where T : IEntity
        {
            RegisterClass(setup);
            services.AddSingleton(sp => CreateRepository<T>(sp.GetService<IMongoClient>(), collectionName));
        }

        private static void RegisterClass<T>(Action<BsonClassMap<T>> setup = null)
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
                {
                    cm.AutoMap();
                    setup?.Invoke(cm);
                });
        }

        private static IRepository<T> CreateRepository<T>(IMongoClient mongoClient, string collectionName)
            where T : IEntity
        {
            return new MongoRepository<T>(mongoClient.GetDatabase("scriptureforge").GetCollection<T>(collectionName));
        }
    }
}
