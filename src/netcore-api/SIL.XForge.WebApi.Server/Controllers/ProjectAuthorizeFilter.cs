using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public class ProjectAuthorizeFilter : IAsyncActionFilter
    {
        private readonly IRepository<Project> _projectRepo;
        private readonly Right _right;

        public ProjectAuthorizeFilter(IRepository<Project> projectRepo, Right right)
        {
            _projectRepo = projectRepo;
            _right = right;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            ClaimsPrincipal claimsPrincipal = context.HttpContext.User;
            if (!claimsPrincipal.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            if (context.ActionArguments.TryGetValue("projectId", out object obj))
            {
                var projectId = obj as string;
                Project project = await _projectRepo.GetAsync(DbNames.Default, projectId);
                if (project != null)
                {
                    string userId = claimsPrincipal.FindFirstValue(ClaimTypes.NameIdentifier);
                    if (project.HasRight(userId, _right))
                    {
                        await next();
                    }
                    else
                    {
                        context.Result = new ForbidResult();
                    }
                }
                else if (context.HttpContext.Request.Method == "GET")
                {
                    context.Result = new NotFoundResult();
                }
                else
                {
                    context.Result = new StatusCodeResult(422);
                }
            }
            else
            {
                context.Result = new BadRequestResult();
            }
        }
    }
}
