using Autofac;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public static class SFJsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddSFJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, IConfiguration configuration)
        {
            services.AddJsonApi(mvcBuilder, containerBuilder, configuration, mapConfig =>
                {
                    mapConfig.CreateMap<UserEntity, SFUserResource>()
                        .IncludeBase<UserEntity, UserResource>()
                        .ReverseMap();
                });

            services.AddSingleton<IParatextService, ParatextService>();
            services.AddSingleton<DeltaUsxMapper>();
            return services;
        }
    }
}
