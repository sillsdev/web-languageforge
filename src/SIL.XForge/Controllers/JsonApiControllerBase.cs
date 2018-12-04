using System.Collections.Generic;
using System.Threading.Tasks;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace SIL.XForge.Controllers
{
    /// <summary>
    /// This is the base class for all JSON-API controllers.
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public abstract class JsonApiControllerBase<T> : JsonApiController<T, string> where T : class, IIdentifiable<string>
    {
        public JsonApiControllerBase(IJsonApiContext jsonApiContext, IResourceService<T, string> resourceService,
            ILoggerFactory loggerFactory) : base(jsonApiContext, resourceService, loggerFactory)
        {
        }

        public override Task<IActionResult> PatchRelationshipsAsync(string id, string relationshipName,
            [FromBody] List<ResourceObject> relationships)
        {
            try
            {
                return base.PatchRelationshipsAsync(id, relationshipName, relationships);
            }
            catch (JsonApiException jae)
            {
                if (jae.GetStatusCode() == StatusCodes.Status400BadRequest)
                {
                    throw UnsupportedRequestMethodException();
                }
                else
                {
                    throw;
                }
            }
        }

        protected JsonApiException UnsupportedRequestMethodException()
        {
            return new JsonApiException(StatusCodes.Status405MethodNotAllowed, "Request method is not supported.",
                "https://json-api-dotnet.github.io/#/errors/UnSupportedRequestMethod");
        }
    }
}
