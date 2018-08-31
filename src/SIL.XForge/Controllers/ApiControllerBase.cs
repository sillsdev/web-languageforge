using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;

namespace SIL.XForge.Controllers
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ApiControllerBase<T> : JsonApiController<T, string> where T : class, IIdentifiable<string>
    {
        public ApiControllerBase(IJsonApiContext jsonApiContext, IResourceService<T, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
