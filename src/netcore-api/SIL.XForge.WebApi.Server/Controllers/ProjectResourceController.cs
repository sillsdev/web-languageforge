using AutoMapper;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public class ProjectResourceController<T> : ResourceController where T : Project
    {
        protected ProjectResourceController(IMapper mapper, IRepository<T> projectRepo)
            : base(mapper)
        {
            ProjectRepo = projectRepo;
        }

        protected IRepository<T> ProjectRepo { get; }

        protected AuthorizeResult Authorize(Project project, Right right)
        {
            return project.HasRight(UserId, right) ? AuthorizeResult.Success : AuthorizeResult.Forbidden;
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
