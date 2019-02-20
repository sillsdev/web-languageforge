using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Realtime;

namespace Microsoft.AspNetCore.Builder
{
    public static class RealtimeApplicationBuilderExtensions
    {
        public static void UseRealtimeServer(this IApplicationBuilder app)
        {
            app.ApplicationServices.GetService<RealtimeServer>().Start();
        }

    }
}
