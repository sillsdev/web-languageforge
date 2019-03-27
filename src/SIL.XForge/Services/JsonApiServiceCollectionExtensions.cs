using System;
using System.Linq;
using System.Reflection;
using Autofac;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Formatters;
using JsonApiDotNetCore.Middleware;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Converters;
using SIL.XForge;
using SIL.XForge.Configuration;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class JsonApiServiceCollectionExtensions
    {
        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, IConfiguration configuration)
        {
            return services.AddJsonApi(mvcBuilder, containerBuilder, configuration, mapConfig => { });
        }

        public static IServiceCollection AddJsonApi(this IServiceCollection services, IMvcBuilder mvcBuilder,
            ContainerBuilder containerBuilder, IConfiguration configuration,
            Action<IMapperConfigurationExpression> configure)
        {
            // setup auto mapper
            var siteOptions = configuration.GetOptions<SiteOptions>();
            string siteKey = siteOptions.Origin.Authority;
            services.AddAutoMapper(mapConfig =>
                {
                    mapConfig.ValidateInlineMaps = false;
                    mapConfig.AddProfile(new XFMapperProfile(siteKey));
                    configure(mapConfig);
                }, new Assembly[0]);

            JsonApiOptions.ResourceNameFormatter = new XFResourceNameFormatter();
            var graphBuilder = new XFResourceGraphBuilder();
            // find all resources
            var assemblies = new[] { Assembly.GetEntryAssembly(), Assembly.GetExecutingAssembly() };
            ResourceDescriptor[] resourceDescriptors = assemblies
                .SelectMany(a => ResourceTypeLocator.GetIdentifableTypes(a)).ToArray();
            foreach (ResourceDescriptor resourceDescriptor in resourceDescriptors)
            {
                // add resource to graph
                string resourceName = JsonApiOptions.ResourceNameFormatter.FormatResourceName(
                    resourceDescriptor.ResourceType);
                graphBuilder.AddResource(resourceDescriptor.ResourceType, resourceDescriptor.IdType, resourceName);

                // register resource service
                Type serviceInterfaceType = typeof(IResourceService<,>);
                Type[] genericArguments = new[] { resourceDescriptor.ResourceType, resourceDescriptor.IdType };
                Type serviceType = ResourceTypeLocator.GetGenericInterfaceImplementation(
                    resourceDescriptor.ResourceType.Assembly, serviceInterfaceType, genericArguments);
                if (serviceType != null)
                    RegisterResourceService(containerBuilder, serviceType);
            }

            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = XForgeConstants.JsonApiNamespace,
                ResourceGraph = graphBuilder.Build(),
                AllowClientGeneratedIds = true,
                IncludeTotalRecordCount = true
            };
            jsonApiOptions.SerializerSettings.ContractResolver = new JsonApiContractResolver();
            jsonApiOptions.SerializerSettings.Converters.Add(new StringEnumConverter());

            mvcBuilder.AddMvcOptions(options =>
                 {
                     options.Filters.Add(typeof(JsonApiExceptionFilter));
                     options.Filters.Add(typeof(TypeMatchFilter));
                     SerializeAsJsonApi(options, jsonApiOptions);
                 });

            services.AddJsonApiInternals(jsonApiOptions);
            services.AddScoped<IDocumentBuilder, XFDocumentBuilder>();

            // generate resource schema
            var schema = ResourceSchema.Build(jsonApiOptions.ResourceGraph, resourceDescriptors);
            services.AddSingleton(schema);

            return services;
        }

        private static void RegisterResourceService(ContainerBuilder containerBuilder, Type serviceType)
        {
            containerBuilder.RegisterType(serviceType)
                .AsImplementedInterfaces()
                .PropertiesAutowired(PropertyWiringOptions.AllowCircularDependencies)
                .InstancePerLifetimeScope();
        }

        private static void SerializeAsJsonApi(MvcOptions options, JsonApiOptions jsonApiOptions)
        {
            options.InputFormatters.Insert(0, new JsonApiInputFormatter());
            options.OutputFormatters.Insert(0, new JsonApiOutputFormatter());
            options.Conventions.Insert(0, new XFDasherizedRoutingConvention(jsonApiOptions.Namespace));
        }
    }
}
