using Autofac;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddScriptureJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder)
        {
            services.AddJsonApi(mvcBuilder, containerBuilder, builder =>
                {
                    builder.AddResource<ScriptureProjectResource, string>("projects");
                });
            containerBuilder.AddResourceService<ScriptureProjectResourceService>();
            return services;
        }
    }
}
