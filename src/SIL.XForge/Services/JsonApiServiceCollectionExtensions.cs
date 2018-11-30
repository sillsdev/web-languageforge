using System;
using Autofac;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Formatters;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Middleware;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public static class JsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, Action<ResourceSchemaBuilder, IMapperConfigurationExpression> configure)
        {
            var schemaBuilder = new ResourceSchemaBuilder();
            services.AddAutoMapper(mapConfig =>
                {
                    configure(schemaBuilder, mapConfig);
                    mapConfig.IgnoreAllUnmapped();
                });

            (ResourceSchema schema, IContextGraph contextGraph) = schemaBuilder.Build();

            services.AddSingleton(schema);

            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = ServicesConstants.JsonApiNamespace,
                ContextGraph = contextGraph,
                AllowClientGeneratedIds = true,
                NullAttributeResponseBehavior = new NullAttributeResponseBehavior(true),
                IncludeTotalRecordCount = true
            };
            jsonApiOptions.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
            jsonApiOptions.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;

            mvcBuilder.AddMvcOptions(options =>
                 {
                     options.Filters.Add(typeof(JsonApiExceptionFilter));
                     options.Filters.Add(typeof(TypeMatchFilter));
                     SerializeAsJsonApi(options, jsonApiOptions);
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

        private static void SerializeAsJsonApi(MvcOptions options, JsonApiOptions jsonApiOptions)
        {
            options.InputFormatters.Insert(0, new JsonApiInputFormatter());
            options.OutputFormatters.Insert(0, new JsonApiOutputFormatter());
            options.Conventions.Insert(0, new XForgeDasherizedRoutingConvention(jsonApiOptions.Namespace));
        }
    }
}
