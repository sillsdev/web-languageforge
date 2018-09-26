using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Controllers
{
    public class UsersController : JsonApiControllerBase<SFUserResource>
    {
        public UsersController(IJsonApiContext jsonApiContext, IResourceService<SFUserResource, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
