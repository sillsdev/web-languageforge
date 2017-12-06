using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public class SiteAuthorizeFilter : IAsyncActionFilter
    {
        private readonly IRepository<User> _userRepo;
        private readonly Right _right;

        public SiteAuthorizeFilter(IRepository<User> userRepo, Right right)
        {
            _userRepo = userRepo;
            _right = right;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            ClaimsPrincipal claimsPrincipal = context.HttpContext.User;
            if (claimsPrincipal.Identity.IsAuthenticated)
            {
                string userId = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
                User user = await _userRepo.GetAsync(DbNames.Default, userId);
                string site = claimsPrincipal.FindFirstValue("aud");
                if (user.HasRight(site, _right))
                {
                    await next();
                }
                else
                {
                    context.Result = new ForbidResult();
                }
            }
            else
            {
                context.Result = new UnauthorizedResult();
            }
        }
    }
}
