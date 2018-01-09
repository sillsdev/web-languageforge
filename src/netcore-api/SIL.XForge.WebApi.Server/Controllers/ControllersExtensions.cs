using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public static class ControllersExtensions
    {
        public static string GetUserId(this Controller controller)
        {
            return controller.User.GetUserId();
        }

        public static string GetUserId(this ClaimsPrincipal user)
        {
            return user.FindFirstValue(ClaimTypes.NameIdentifier);
        }
    }
}
