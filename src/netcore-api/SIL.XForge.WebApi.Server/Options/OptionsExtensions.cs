using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.WebApi.Server.Options
{
    public static class OptionsExtensions
    {
        public static IServiceCollection AddOptions(this IServiceCollection services, IConfiguration config)
        {
            services.Configure<AppOptions>(config.GetSection("App"));
            services.Configure<ParatextOptions>(config.GetSection("Paratext"));
            services.Configure<SendReceiveOptions>(config.GetSection("SendReceive"));
            return services;
        }
    }
}
