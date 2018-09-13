using Autofac;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public static class SFJsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddSFJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder)
        {
            services.AddJsonApi(mvcBuilder, containerBuilder, (schemaBuilder, mapConfig) =>
                {
                    // users
                    schemaBuilder.AddResourceType<UserResource>("users");
                    containerBuilder.RegisterResourceService<SFUserResourceService>();
                    mapConfig.CreateMap<UserEntity, UserResource>()
                        .ForMember(u => u.Projects, o => o.Ignore())
                        .ForMember(u => u.Password, o => o.Ignore())
                        .ReverseMap();

                    // projects
                    schemaBuilder.AddResourceType<SFProjectResource>("projects");
                    containerBuilder.RegisterResourceService<SFProjectResourceService>();
                    mapConfig.CreateMap<SFProjectEntity, SFProjectResource>()
                        .ReverseMap();
                });
            return services;
        }
    }
}
