using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Controllers
{
    [Route("users")]
    public class SFUsersController : UsersController<SFUserResource>
    {
        public SFUsersController(IJsonApiContext jsonApiContext, IUserService<SFUserResource> userService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, userService, loggerFactory)
        {
        }
    }
}
