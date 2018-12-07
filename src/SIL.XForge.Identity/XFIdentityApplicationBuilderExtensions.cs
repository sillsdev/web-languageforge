using EdjCase.JsonRpc.Router.RouteProviders;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Options;
using SIL.XForge.Identity.Controllers;

namespace SIL.XForge.Identity
{
    public static class XFIdentityApplicationBuilderExtensions
    {
        public static void UseXFIdentityServer(this IApplicationBuilder app)
        {
            app.UseIdentityServer();
            var options = new SingleRouteOptions { BaseRequestPath = "/identity-api" };
            options.AddClass<IdentityRpcController>();
            app.UseJsonRpc(new RpcSingleRouteProvider(Options.Create(options)));
        }
    }
}
