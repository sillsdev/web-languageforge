// Copyright (c) 2018 SIL International
// This software is licensed under the MIT License (http://opensource.org/licenses/MIT)

using Bugsnag;
using Bugsnag.AspNet.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;

namespace SIL.XForge.ExceptionLogging
{
    public static class ExceptionLoggingServiceCollectionExtensions
    {
        /// <summary>
        /// Add Bugsnag to your application. Configures the required bugsnag services and attaches
        /// the Bugsnag middleware to catch unhandled exceptions.
        /// </summary>
        public static IServiceCollection AddExceptionLogging(this IServiceCollection services)
        {
            // We add bugsnag manually instead of using the official AddBugsnag() extension
            // method because we want a singleton instead of a scoped object.
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            return services.AddSingleton<IConfigureOptions<Bugsnag.Configuration>, BugsnagConfigurator>()
                .AddSingleton<IStartupFilter, BugsnagStartupFilter>()
                .AddSingleton<IClient, Client>(context => new Client(context.GetService<IOptions<Bugsnag.Configuration>>().Value));
        }
    }
}
