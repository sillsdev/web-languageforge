using System;
using SIL.XForge.Configuration;
using SIL.XForge.Realtime;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class RealtimeServiceCollectionExtensions
    {
        public static IServiceCollection AddRealtimeServer(this IServiceCollection services,
            Action<RealtimeOptions> configureOptions, bool launchWithDebugging = false)
        {
            services.AddNodeServices(options =>
            {
                options.LaunchWithDebugging = launchWithDebugging;
                options.WatchFileExtensions = new string[0];
            });
            services.Configure(configureOptions);
            services.AddSingleton<IRealtimeService, RealtimeService>();
            return services;
        }
    }
}
