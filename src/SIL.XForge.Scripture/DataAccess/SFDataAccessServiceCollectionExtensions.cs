using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Serializers;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class SFDataAccessServiceCollectionExtensions
    {
        public static IServiceCollection AddSFDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDataAccess(configuration);

            DataAccessClassMap.RegisterConcreteClass<ProjectUserEntity, SFProjectUserEntity>();

            services.AddMongoRepository<SFProjectEntity>("sf_projects");
            services.AddMongoRepository<SyncJobEntity>("sync_jobs");
            services.AddMongoRepository<TextEntity>("texts");
            services.AddMongoRepository<TranslateMetrics>("translate_metrics",
                cm => cm.MapProperty(m => m.SessionId).SetSerializer(new StringSerializer(BsonType.ObjectId)));

            return services;
        }
    }
}
