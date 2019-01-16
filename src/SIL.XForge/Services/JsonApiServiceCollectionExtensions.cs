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
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using SIL.XForge.Configuration;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public static class JsonApiServiceCollectionExtensions
    {
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
                    mapConfig.AddProfile(new UserProfile(siteKey));
                    configure(mapConfig);
                }, new Assembly[0]);

            JsonApiOptions.ResourceNameFormatter = new XForgeResourceNameFormatter();
            var graphBuilder = new ResourceGraphBuilder();
            // find all resources
            ResourceDescriptor[] resourceDescriptors = ResourceTypeLocator.GetIdentifableTypes(
                Assembly.GetEntryAssembly()).ToArray();
            foreach (ResourceDescriptor resourceDescriptor in resourceDescriptors)
            {
                // add resource to graph
                string resourceName = JsonApiOptions.ResourceNameFormatter.FormatResourceName(
                    resourceDescriptor.ResourceType);
                graphBuilder.AddResource(resourceDescriptor.ResourceType, resourceDescriptor.IdType, resourceName);

                // register resource service
                Type serviceInterfaceType = typeof(IResourceService<,>);
                Type[] genericArguments = new[] { resourceDescriptor.ResourceType, resourceDescriptor.IdType };
                Type serviceType = ResourceTypeLocator.GetGenericInterfaceImplementation(Assembly.GetEntryAssembly(),
                    serviceInterfaceType, genericArguments);
                if (serviceType != null)
                    RegisterResourceService(containerBuilder, serviceType);
            }

            var jsonApiOptions = new JsonApiOptions
            {
                Namespace = XForgeConstants.JsonApiNamespace,
                ResourceGraph = graphBuilder.Build(),
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
            services.AddScoped<IDocumentBuilder, XForgeDocumentBuilder>();

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
            options.Conventions.Insert(0, new XForgeDasherizedRoutingConvention(jsonApiOptions.Namespace));
        }
    }
}
