// Copyright (c) 2018 SIL International
// This software is licensed under the MIT License (http://opensource.org/licenses/MIT)

using Bugsnag;
using Microsoft.Extensions.DependencyInjection;

namespace Microsoft.AspNetCore.Builder
{
    public static class ExceptionLoggingApplicationBuilderExtensions
    {
        public static void UseExceptionLogging(this IApplicationBuilder app)
        {
            // Force the creation of the bugsnag client
            app.ApplicationServices.GetService<IClient>();
        }

    }
}
