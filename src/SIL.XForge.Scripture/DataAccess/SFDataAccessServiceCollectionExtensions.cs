using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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

            IConfigurationSection dataAccessConfig = configuration.GetSection("DataAccess");
            string databaseName = dataAccessConfig.GetValue("MongoDatabaseName", "xforge");
            services.AddMongoRepository<SFProjectEntity>(databaseName, "sf_projects");

            return services;
        }
    }
}
