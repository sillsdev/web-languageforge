using System;
using Autofac;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Middleware;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, Action<IContextGraphBuilder, IMapperConfigurationExpression> configure)
        {
            var graphBuilder = new ContextGraphBuilder();
            services.AddAutoMapper(mapConfig =>
                {
                    graphBuilder.AddResource<UserResource, UserEntity>(mapConfig, "users",
                        m => m.ForMember(u => u.Projects, o => o.Ignore()));
                    configure(graphBuilder, mapConfig);
                });

            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = "api",
                ContextGraph = graphBuilder.Build()
            };
            jsonApiOptions.SerializerSettings.ContractResolver = new XForgeDasherizedResolver();

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

        public static void AddResourceService<TResource, TEntity, TService>(this IContextGraphBuilder graphBuilder,
            ContainerBuilder containerBuilder, IMapperConfigurationExpression mapConfig, string typeName,
            Func<IMappingExpression<TEntity, TResource>, IMappingExpression<TEntity, TResource>> mapping = null)
            where TResource: class, IIdentifiable<string>
        {
            containerBuilder.RegisterResourceService<TService>();
            graphBuilder.AddResource(mapConfig, typeName, mapping);
        }

        public static void AddResource<TResource, TEntity>(this IContextGraphBuilder graphBuilder,
            IMapperConfigurationExpression mapConfig, string typeName,
            Func<IMappingExpression<TEntity, TResource>, IMappingExpression<TEntity, TResource>> mapping = null)
            where TResource : class, IIdentifiable<string>
        {
            graphBuilder.AddResource<TResource, string>(typeName);
            var m = mapConfig.CreateMap<TEntity, TResource>();
            if (mapping != null)
                m = mapping(m);
            m.ReverseMap();
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
