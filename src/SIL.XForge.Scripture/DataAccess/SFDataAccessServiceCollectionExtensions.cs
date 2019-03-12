using Microsoft.Extensions.Configuration;
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

            return services;
        }
    }
}
