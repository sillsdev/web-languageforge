using Autofac;
using Microsoft.Extensions.Configuration;
using SIL.XForge.Scripture.Services;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class SFJsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddSFJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, IConfiguration configuration)
        {
            services.AddJsonApi(mvcBuilder, containerBuilder, configuration, mapConfig =>
            {
                mapConfig.AddProfile<SFMapperProfile>();
            });

            services.AddSingleton<IParatextService, ParatextService>();
            services.AddSingleton<DeltaUsxMapper>();
            services.AddSingleton<SyncJobManager>();
            return services;
        }
    }
}
