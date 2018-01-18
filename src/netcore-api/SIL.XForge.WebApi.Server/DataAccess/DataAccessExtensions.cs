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
using SIL.XForge.WebApi.Server.Models.Lexicon;
using SIL.XForge.WebApi.Server.Models.Translate;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public static class DataAccessExtensions
    {
        public static IRepository<T> Create<T>(this IProjectRepositoryFactory<T> factory, Project project)
            where T : IEntity
        {
            return factory.Create(project.ProjectCode);
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
            BsonSerializer.RegisterDiscriminatorConvention(typeof(LexConfig),
                new HierarchicalDiscriminatorConvention("type"));
            BsonSerializer.RegisterDiscriminatorConvention(typeof(LexViewFieldConfig),
                new HierarchicalDiscriminatorConvention("type"));
            BsonSerializer.RegisterDiscriminatorConvention(typeof(LexTask),
                new HierarchicalDiscriminatorConvention("type"));

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
            RegisterClass<LexConfig>(cm =>
                {
                    cm.MapMember(lc => lc.HideIfEmpty).SetSerializer(new EmptyStringBooleanSerializer());
                });
            RegisterClass<LexConfigFieldList>(cm => cm.SetDiscriminator(LexConfig.FieldList));
            RegisterClass<LexConfigOptionList>(cm => cm.SetDiscriminator(LexConfig.OptionList));
            RegisterClass<LexConfigMultiOptionList>(cm => cm.SetDiscriminator(LexConfig.MultiOptionList));
            RegisterClass<LexConfigMultiText>(cm => cm.SetDiscriminator(LexConfig.MultiText));
            RegisterClass<LexConfigPictures>(cm => cm.SetDiscriminator(LexConfig.Pictures));
            RegisterClass<LexConfigMultiParagraph>(cm => cm.SetDiscriminator(LexConfig.MultiParagraph));
            RegisterClass<LexViewFieldConfig>(cm => cm.SetDiscriminator("basic"));
            RegisterClass<LexViewMultiTextFieldConfig>(cm => cm.SetDiscriminator("multitext"));
            RegisterClass<LexTask>(cm => cm.SetDiscriminator(""));
            RegisterClass<LexTaskDashboard>(cm => cm.SetDiscriminator(LexTask.Dashboard));
            RegisterClass<LexTaskSemdom>(cm => cm.SetDiscriminator(LexTask.Semdom));
            RegisterClass<LexAuthorInfo>(cm =>
                {
                    cm.MapMember(a => a.ModifiedByUserRef)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                    cm.MapMember(a => a.CreatedByUserRef)
                        .SetSerializer(new StringSerializer(BsonType.ObjectId));
                });
            RegisterClass<LexSense>(cm =>
                {
                    cm.UnmapMember(s => s.CustomFields);
                    cm.UnmapMember(s => s.AuthorInfo);
                    cm.UnmapMember(s => s.ReversalEntries);
                });

            services.AddSingleton<IMongoClient>(sp => new MongoClient(connectionString));

            services.AddMongoRepository<SendReceiveJob>("send_receive");
            services.AddMongoRepository<User>("users", cm =>
                {
                    cm.MapMember(u => u.SiteRole).SetSerializer(
                        new DictionaryInterfaceImplementerSerializer<Dictionary<string, string>>(
                            DictionaryRepresentation.Document, new SiteDomainSerializer(), new StringSerializer()));
                    cm.MapMember(u => u.Projects)
                        .SetSerializer(new EnumerableInterfaceImplementerSerializer<List<string>, string>(
                            new StringSerializer(BsonType.ObjectId)));
                });
            services.AddMongoRepository<Project>("projects");
            services.AddMongoRepository<LexProject>("projects", cm => cm.SetDiscriminator("lexicon"));
            services.AddMongoRepository<TranslateProject>("projects", cm => cm.SetDiscriminator("translate"));
            services.AddMongoProjectRepositoryFactory<TranslateDocumentSet>("translate");
            services.AddMongoProjectRepositoryFactory<LexEntry>("lexicon", cm =>
                {
                    cm.UnmapMember(e => e.Environments);
                    cm.UnmapMember(e => e.MorphologyType);
                });
            return services;
        }

        private static void AddMongoRepository<T>(this IServiceCollection services, string collectionName,
            Action<BsonClassMap<T>> setup = null) where T : IEntity
        {
            RegisterClass<T>(setup);
            services.AddSingleton<IRepository<T>>(sp =>
                new MongoRepository<T>(sp.GetService<IMongoClient>().GetDatabase("scriptureforge")
                    .GetCollection<T>(collectionName)));
        }

        private static void AddMongoProjectRepositoryFactory<T>(this IServiceCollection services, string collectionName,
            Action<BsonClassMap<T>> setup = null) where T : IEntity
        {
            RegisterClass<T>(setup);
            services.AddSingleton<IProjectRepositoryFactory<T>>(sp =>
                new MongoProjectRepositoryFactory<T>(sp.GetService<IMongoClient>(), collectionName));
        }

        private static void RegisterClass<T>(Action<BsonClassMap<T>> setup = null)
        {
            BsonClassMap.RegisterClassMap<T>(cm =>
                {
                    cm.AutoMap();
                    setup?.Invoke(cm);
                });
        }
    }
}
