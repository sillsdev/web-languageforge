using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.DataAccess
{
    public static class DataAccessExtensions
    {
        public static IServiceCollection AddScriptureDataAccess(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddDataAccess(configuration);
            services.AddMongoRepository<ProjectEntity>("sf_projects");
            services.AddMongoRepository<ScriptureProjectEntity>("sf_projects");
            return services;
        }
    }
}
