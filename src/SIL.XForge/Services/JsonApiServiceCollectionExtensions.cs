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

namespace SIL.XForge.Services
{
    public static class JsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, Action<SchemaBuilder, IMapperConfigurationExpression> configure)
        {
            var schemaBuilder = new SchemaBuilder();
            services.AddAutoMapper(mapConfig => configure(schemaBuilder, mapConfig));

            Schema schema = schemaBuilder.Build();

            services.AddSingleton<Schema>(schema);
            services.AddSingleton<SchemaResourceService>();

            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = "api",
                ContextGraph = schema.ContextGraph
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
