using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Controllers
{
    [Route("users")]
    public class SFUsersController : JsonApiControllerBase<SFUserResource>
    {
        public SFUsersController(IJsonApiContext jsonApiContext, IResourceService<SFUserResource, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
