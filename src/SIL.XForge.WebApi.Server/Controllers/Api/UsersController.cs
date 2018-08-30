using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Controllers.Api
{
    public class UsersController : ApiControllerBase<UserResource>
    {
        public UsersController(IJsonApiContext jsonApiContext, IResourceService<UserResource, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
