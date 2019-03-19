using System.Threading.Tasks;
using EdjCase.JsonRpc.Router;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Routing;

namespace SIL.XForge.Services
{
    public class XFRpcHttpRouter : IRouter
    {
        private readonly RpcHttpRouter _internalRouter;

        public XFRpcHttpRouter()
        {
            _internalRouter = new RpcHttpRouter(new XFRpcRouteProvider());
        }

        public VirtualPathData GetVirtualPath(VirtualPathContext context)
        {
            return _internalRouter.GetVirtualPath(context);
        }

        public async Task RouteAsync(RouteContext context)
        {
            if (context.HttpContext.Request.ContentType != "application/json")
                return;
            if (!context.HttpContext.Request.Path.Value.EndsWith($"/{XForgeConstants.CommandsEndpoint}"))
                return;

            AuthenticateResult result = await context.HttpContext.AuthenticateAsync(
                JwtBearerDefaults.AuthenticationScheme);
            if (result.Succeeded)
                context.HttpContext.User = result.Principal;
            await _internalRouter.RouteAsync(context);
        }
    }
}
