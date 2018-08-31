using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.Controllers;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Controllers
{
    public class ProjectsController : ApiControllerBase<ScriptureProjectResource>
    {
        public ProjectsController(IJsonApiContext jsonApiContext,
            IResourceService<ScriptureProjectResource, string> resourceService, ILoggerFactory loggerFactory)
            : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
