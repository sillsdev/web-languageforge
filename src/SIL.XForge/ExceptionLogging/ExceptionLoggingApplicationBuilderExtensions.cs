// Copyright (c) 2018 SIL International
// This software is licensed under the MIT License (http://opensource.org/licenses/MIT)

using Bugsnag;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.ExceptionLogging
{
    public static class ExceptionLoggingApplicationBuilderExtensions
    {
        public static void UseBugsnag(this IApplicationBuilder app)
        {
            // Force the creation of the bugsnag client
            app.ApplicationServices.GetService<IClient>();
        }

    }
}
