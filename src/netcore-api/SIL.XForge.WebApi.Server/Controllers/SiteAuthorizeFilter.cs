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
                if (!(await _userRepo.TryGetAsync(userId)).TryResult(out User user))
                {
                    context.Result = new UnauthorizedResult();
                    return;
                }
                string site = claimsPrincipal.FindFirstValue("aud");
                Right right = _right;
                if (CheckOwnOperation(userId, context))
                {
                    Operation op = Operation.View;
                    switch (right.Operation)
                    {
                        case Operation.DeleteOwn:
                            op = Operation.Delete;
                            break;
                        case Operation.EditOwn:
                            op = Operation.Edit;
                            break;
                        case Operation.ViewOwn:
                            op = Operation.View;
                            break;
                    }

                    right = new Right(right.Domain, op);
                }

                if (user.HasRight(site, right))
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

        private bool CheckOwnOperation(string userId, ActionExecutingContext context)
        {
            if (_right.Operation != Operation.DeleteOwn && _right.Operation != Operation.EditOwn
                && _right.Operation != Operation.ViewOwn)
            {
                return false;
            }

            string argUserId;
            if (context.ActionArguments.TryGetValue("userId", out object obj))
            {
                argUserId = (string) obj;
                if (argUserId == "me" || argUserId == "my")
                    argUserId = userId;
            }
            else
            {
                // assume that the API will only get the current user's data
                argUserId = userId;
            }

            return userId != argUserId;
        }
    }
}
