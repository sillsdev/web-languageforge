using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public static class ControllersExtensions
    {
        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        public static string FullRouteUrl(this IUrlHelper urlHelper, string routeName, object values = null)
        {
            return "/api2" + urlHelper.RouteUrl(routeName, values);
        }

        public static string FullRouteUrl(this IUrlHelper urlHelper, string routeName, string idName, string id)
        {
            return urlHelper.FullRouteUrl(routeName, new Dictionary<string, string> { { idName, id } });
        }
    }
}
