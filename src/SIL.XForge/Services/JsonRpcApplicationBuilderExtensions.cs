using Microsoft.AspNetCore.Builder;

namespace SIL.XForge.Services
{
    public static class JsonRpcApplicationBuilderExtensions
    {
        public static void UseXFJsonRpc(this IApplicationBuilder app)
        {
            app.UseRouter(new XForgeRpcHttpRouter());
        }
    }
}
