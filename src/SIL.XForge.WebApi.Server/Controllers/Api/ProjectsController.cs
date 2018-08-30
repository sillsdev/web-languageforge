using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Controllers.Api
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
