using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.Scripture.Realtime
{
    public static class RealtimeApplicationBuilderExtensions
    {
        public static void UseRealtimeServer(this IApplicationBuilder app)
        {
            app.ApplicationServices.GetService<RealtimeServer>().Start();
        }

    }
}
