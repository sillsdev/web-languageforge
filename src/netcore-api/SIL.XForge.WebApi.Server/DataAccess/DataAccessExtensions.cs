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
using SIL.XForge.WebApi.Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public static class DataAccessExtensions
    {
        public static IRepository<T> Get<T>(this IProjectRepositoryFactory<T> factory, Project project)
            where T : IEntity
        {
            return factory.Get(project.ProjectCode);
        }

        public static Task<T> UpdateAsync<T>(this IRepository<T> repo, T entity,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false) where T : IEntity
        {
            return repo.UpdateAsync(e => e.Id == entity.Id, update, upsert);
        }

        public static async Task<bool> DeleteAsync<T>(this IRepository<T> repo, T entity) where T : IEntity
        {
            return await repo.DeleteAsync(e => e.Id == entity.Id) != null;
        }

        public static IServiceCollection AddMongoDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            IConfigurationSection dataAccessConfig = configuration.GetSection("DataAccess");
            string connectionString = dataAccessConfig.GetValue<string>("ConnectionString");
            services.AddHangfire(x => x.UseMongoStorage(connectionString, "jobs"));

            BsonSerializer.RegisterDiscriminatorConvention(typeof(Project),
                new HierarchicalDiscriminatorConvention("appName"));
            var pack = new ConventionPack
            {
                new CamelCaseElementNameConvention(),
                new ObjectRefConvention()
            };
            ConventionRegistry.Register("Custom", pack, t => true);

            services.AddSingleton<IMongoClient>(sp => new MongoClient(connectionString));

            services.AddMongoRepository<SendReceiveJob>("send_receive");
            services.AddMongoRepository<User>("users", cm =>
                {
                    cm.MapMember(u => u.SiteRole).SetSerializer(
                        new DictionaryInterfaceImplementerSerializer<Dictionary<string, string>>(
                            DictionaryRepresentation.Document, new SiteDomainSerializer(), new StringSerializer()));
                });
            services.AddMongoRepository<Project>("projects");
            services.AddMongoRepository<LexProject>("projects", cm =>
                {
                    cm.SetDiscriminator("lexicon");
                }, true);
            services.AddMongoRepository<TranslateProject>("projects", cm =>
                {
                    cm.SetDiscriminator("translate");
                }, true);
            return services;
        }

        private static void AddMongoRepository<T>(this IServiceCollection services, string collectionName,
            Action<BsonClassMap<T>> setup = null, bool subClass = false) where T : IEntity
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
                {
                    cm.AutoMap();
                    if (!subClass)
                    {
                        cm.MapIdProperty(e => e.Id)
                            .SetIdGenerator(StringObjectIdGenerator.Instance)
                            .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    }
                    setup?.Invoke(cm);
                });
            services.AddSingleton<IRepository<T>>(sp =>
                new MongoRepository<T>(sp.GetService<IMongoClient>().GetDatabase("scriptureforge")
                    .GetCollection<T>(collectionName)));
        }
    }
}
