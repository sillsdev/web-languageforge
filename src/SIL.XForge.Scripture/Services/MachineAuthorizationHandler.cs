using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using SIL.Machine.WebApi.Models;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    /// <summary>
    /// This class is responsible for authorizing access to Machine API endpoints.
    /// </summary>
    public class MachineAuthorizationHandler : IAuthorizationHandler
    {
        private readonly IRepository<SFProjectEntity> _projects;

        public MachineAuthorizationHandler(IRepository<SFProjectEntity> projects)
        {
            _projects = projects;
        }

        public async Task HandleAsync(AuthorizationHandlerContext context)
        {
            string projectId = null;
            switch (context.Resource)
            {
                case Project project:
                    projectId = project.Id;
                    break;
                case Engine engine:
                    projectId = engine.Projects.First();
                    break;
            }
            if (projectId != null)
            {
                string userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (await _projects.Query().AnyAsync(p => p.Id == projectId && p.Users.Any(pu => pu.UserRef == userId)))
                {
                    List<IAuthorizationRequirement> pendingRequirements = context.PendingRequirements.ToList();
                    foreach (IAuthorizationRequirement requirement in pendingRequirements)
                        context.Succeed(requirement);
                }
            }
        }
    }
}
