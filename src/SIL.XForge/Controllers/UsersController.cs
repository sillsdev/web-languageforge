using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.Models;

namespace SIL.XForge.Controllers
{
    public class UsersController : ApiControllerBase<UserResource>
    {
        public UsersController(IJsonApiContext jsonApiContext, IResourceService<UserResource, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
