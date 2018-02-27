using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.WebApi.Server.Services
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddSingleton<SendReceiveService>();
            services.AddSingleton<ParatextService>();
            services.AddSingleton<AssetService>();
            return services;
        }
    }
}
