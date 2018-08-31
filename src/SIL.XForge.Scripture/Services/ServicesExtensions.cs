using Autofac;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddSFJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder)
        {
            containerBuilder.RegisterResourceService<SFUserResourceService>();

            services.AddJsonApi(mvcBuilder, containerBuilder, (graphBuilder, mapConfig) =>
                {
                    graphBuilder.AddResourceService<SFProjectResource, SFProjectEntity, SFProjectResourceService>(
                        containerBuilder, mapConfig, "projects");
                });
            return services;
        }
    }
}
