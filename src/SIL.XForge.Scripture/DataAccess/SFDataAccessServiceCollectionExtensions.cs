using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.DataAccess
{
    public static class SFDataAccessServiceCollectionExtensions
    {
        public static IServiceCollection AddSFDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDataAccess(configuration);

            var options = configuration.GetOptions<DataAccessOptions>();
            services.AddMongoRepository<SFProjectEntity>(options.MongoDatabaseName, "sf_projects");
            services.AddMongoRepository<SyncJobEntity>(options.MongoDatabaseName, "sr_jobs");
            services.AddMongoRepository<TextEntity>(options.MongoDatabaseName, "texts");

            return services;
        }
    }
}
