using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.DependencyInjection;
using System.Collections.Generic;
using System.Reflection;
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

        public static IServiceCollection AddModelToDtoMapper(this IServiceCollection services)
        {
            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            services.AddScoped(sp =>
            {
                var actionCtxtAccessor = sp.GetRequiredService<IActionContextAccessor>();
                var urlHelperFactory = sp.GetRequiredService<IUrlHelperFactory>();
                return urlHelperFactory.GetUrlHelper(actionCtxtAccessor.ActionContext);
            });
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            return services;
        }
    }
}
