using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Authorize]
    public class ProjectResourceController<T> : Controller where T : Project
    {
        protected ProjectResourceController(IRepository<T> projectRepo)
        {
            ProjectRepo = projectRepo;
        }

        protected IRepository<T> ProjectRepo { get; }

        protected AuthorizeResult Authorize(Project project, Right right)
        {
            if (project != null)
            {
                string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (project.HasRight(userId, new Right(Domain.Projects, Operation.Edit)))
                {
                    return AuthorizeResult.Success;
                }
                else
                {
                    return AuthorizeResult.Forbidden;
                }
            }
            return AuthorizeResult.NotFound;
        }

        protected async Task<AuthorizeResult> AuthorizeAsync(string projectId, Right right)
        {
            Project project = await ProjectRepo.GetAsync(DbNames.Default, projectId);
            return Authorize(project, right);
        }

        protected enum AuthorizeResult
        {
            Success,
            Forbidden,
            NotFound
        }
    }
}
