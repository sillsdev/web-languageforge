using System;
using Autofac;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Middleware;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Serialization;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public static class JsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, Action<IContextGraphBuilder, IMapperConfigurationExpression> configure)
        {
            var graphBuilder = new ContextGraphBuilder();
            services.AddAutoMapper(mapConfig =>
                {
                    // users
                    graphBuilder.AddResource<UserResource, string>("users");
                    mapConfig.CreateMap<UserEntity, UserResource>()
                        .ForMember(u => u.Projects, o => o.Ignore())
                        .ReverseMap();

                    configure(graphBuilder, mapConfig);
                });

            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = "api",
                ContextGraph = graphBuilder.Build()
            };
            jsonApiOptions.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            mvcBuilder.AddMvcOptions(options =>
                 {
                     options.Filters.Add(typeof(JsonApiExceptionFilter));
                     options.Filters.Add(typeof(TypeMatchFilter));
                     options.SerializeAsJsonApi(jsonApiOptions);
                 });

            services.AddJsonApiInternals(jsonApiOptions);
            services.AddScoped<IQueryParser, XForgeQueryParser>();
            services.AddScoped<IDocumentBuilder, XForgeDocumentBuilder>();

            return services;
        }

        public static void RegisterResourceService<T>(this ContainerBuilder containerBuilder)
        {
            containerBuilder.RegisterType<T>()
                .AsImplementedInterfaces()
                .PropertiesAutowired(PropertyWiringOptions.AllowCircularDependencies)
                .InstancePerLifetimeScope();
        }
    }
}
