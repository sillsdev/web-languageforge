using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Configuration;

namespace SIL.XForge.Scripture.Configuration
{
    public static class SFConfigurationServiceCollectionExtensions
    {
        public static IServiceCollection AddSFConfiguration(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddConfiguration(configuration);
            services.AddOptions<ParatextOptions>(configuration);
            services.AddOptions<RealtimeOptions>(configuration);
            return services;
        }
    }
}
