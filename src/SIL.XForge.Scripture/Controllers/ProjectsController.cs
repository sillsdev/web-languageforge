using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.Controllers;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Controllers
{
    public class ProjectsController : ApiControllerBase<ProjectResource>
    {
        public ProjectsController(IJsonApiContext jsonApiContext,
            IResourceService<ProjectResource, string> resourceService, ILoggerFactory loggerFactory)
            : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
