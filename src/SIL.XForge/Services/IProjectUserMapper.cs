using System.Collections.Generic;
using System.Threading.Tasks;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IProjectUserMapper : IResourceMapper<ProjectUserResource, ProjectUserEntity>
    {
        Task<List<string>> MembersInAdminProjects();
    }
}
