using System;
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
            ContainerBuilder containerBuilder, Action<IContextGraphBuilder> contextGraphBuilder)
        {
            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = "api"
            };
            jsonApiOptions.SerializerSettings.ContractResolver = new XForgeDasherizedResolver();
            jsonApiOptions.BuildContextGraph(builder =>
                {
                    builder.AddResource<UserResource, string>("users");
                    contextGraphBuilder(builder);
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

            containerBuilder.AddResourceService<UserResourceService>();
            containerBuilder.AddResourceService<ProjectResourceService>();
            return services;
        }

        public static ContainerBuilder AddResourceService<T>(this ContainerBuilder containerBuilder)
        {
            containerBuilder.RegisterType<T>()
                .AsImplementedInterfaces()
                .PropertiesAutowired(PropertyWiringOptions.AllowCircularDependencies)
                .InstancePerLifetimeScope();
            return containerBuilder;
        }
    }
}
