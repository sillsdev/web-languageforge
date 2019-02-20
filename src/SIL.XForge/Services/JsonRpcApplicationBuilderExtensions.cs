using SIL.XForge.Services;

namespace Microsoft.AspNetCore.Builder
{
    public static class JsonRpcApplicationBuilderExtensions
    {
        public static void UseXFJsonRpc(this IApplicationBuilder app)
        {
            app.UseRouter(new XFRpcHttpRouter());
        }
    }
}
