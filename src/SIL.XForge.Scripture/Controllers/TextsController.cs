using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.Controllers;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Controllers
{
    public class TextsController : JsonApiControllerBase<TextResource>
    {
        public TextsController(IJsonApiContext jsonApiContext, IResourceService<TextResource, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
