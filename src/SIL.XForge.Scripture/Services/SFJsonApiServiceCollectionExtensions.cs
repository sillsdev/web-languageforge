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
                    schemaBuilder.AddResourceType<SFUserResource>("users");
                    containerBuilder.RegisterResourceService<SFUserService>();
                    mapConfig.CreateMap<UserEntity, SFUserResource>()
                        .ForMember(u => u.Password, o => o.Ignore())
                        .ReverseMap();

                    // projects
                    schemaBuilder.AddResourceType<SFProjectResource>("projects");
                    containerBuilder.RegisterResourceService<SFProjectService>();

                    // project users
                    schemaBuilder.AddResourceType<SFProjectUserResource>("project-users");
                    containerBuilder.RegisterResourceService<SFProjectUserService>();

                    // sync jobs
                    schemaBuilder.AddResourceType<SyncJobResource>("sync-jobs");
                    containerBuilder.RegisterResourceService<SyncJobService>();
                });

            services.AddSingleton<IParatextService, ParatextService>();
            services.AddSingleton<DeltaUsxMapper>();
            return services;
        }
    }
}
