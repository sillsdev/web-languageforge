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

        protected async Task<AuthorizeResult> AuthorizeAsync(string projectId, Right right)
        {
            if ((await ProjectRepo.TryGetAsync(projectId)).TryResult(out T project))
                return Authorize(project, right);
            return AuthorizeResult.NotFound;
        }

        protected enum AuthorizeResult
        {
            Success,
            Forbidden,
            NotFound
        }
    }
}
