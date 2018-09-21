using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.Scripture.Realtime
{
    public static class RealtimeServiceCollectionExtensions
    {
        public static IServiceCollection AddRealtimeServer(this IServiceCollection services,
            bool launchWithDebugging = false)
        {
            services.AddNodeServices(options =>
            {
                options.LaunchWithDebugging = launchWithDebugging;
                options.WatchFileExtensions = new string[0];
            });
            services.AddSingleton<RealtimeServer>();
            return services;
        }
    }
}
