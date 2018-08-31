using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class ScriptureProjectResourceService
        : ProjectResourceService<ScriptureProjectResource, ScriptureProjectEntity>
    {
        public ScriptureProjectResourceService(IJsonApiContext jsonApiContext, IRepository<ProjectEntity> projects,
            IRepository<ScriptureProjectEntity> entities, IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, projects, entities, mapper, httpContextAccessor)
        {
        }
    }
}
