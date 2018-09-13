using Autofac;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public static class SFJsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddSFJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder)
        {
            containerBuilder.RegisterResourceService<SFUserResourceService>();

            services.AddJsonApi(mvcBuilder, containerBuilder, (graphBuilder, mapConfig) =>
                {
                    // projects
                    graphBuilder.AddResource<SFProjectResource, string>("projects");
                    containerBuilder.RegisterResourceService<SFProjectResourceService>();
                    mapConfig.CreateMap<SFProjectEntity, SFProjectResource>()
                        .ReverseMap();
                });
            return services;
        }
    }
}
