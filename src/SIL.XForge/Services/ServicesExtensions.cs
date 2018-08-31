using Autofac;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Middleware;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder)
        {
            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = "api"
            };
            jsonApiOptions.BuildContextGraph(builder =>
                {
                    builder.AddResource<UserResource, string>("users");
                    builder.AddResource<ProjectResource, string>("projects");
                });

            mvcBuilder.AddMvcOptions(options =>
                 {
                     options.Filters.Add(typeof(JsonApiExceptionFilter));
                     options.Filters.Add(typeof(TypeMatchFilter));
                     options.SerializeAsJsonApi(jsonApiOptions);
                 });

            services.AddJsonApiInternals(jsonApiOptions);
            services.AddScoped<IQueryParser, XForgeQueryParser>();
            services.AddScoped<IDocumentBuilder, XForgeDocumentBuilder>();

            services.AddAutoMapper();

            containerBuilder.RegisterType<UserResourceService>()
                .AsImplementedInterfaces()
                .AsSelf()
                .PropertiesAutowired(PropertyWiringOptions.AllowCircularDependencies)
                .InstancePerLifetimeScope();
            containerBuilder.RegisterType<ProjectResourceService>()
                .AsImplementedInterfaces()
                .AsSelf()
                .PropertiesAutowired(PropertyWiringOptions.AllowCircularDependencies)
                .InstancePerLifetimeScope();

            return services;
        }
    }
}
