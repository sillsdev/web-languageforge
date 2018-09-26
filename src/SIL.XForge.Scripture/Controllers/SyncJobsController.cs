using System.Collections.Generic;
using System.Threading.Tasks;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SIL.XForge.Controllers;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Controllers
{
    public class SyncJobsController : JsonApiControllerBase<SyncJobResource>
    {
        public SyncJobsController(IJsonApiContext jsonApiContext,
            IResourceService<SyncJobResource, string> resourceService, ILoggerFactory loggerFactory)
            : base(jsonApiContext, resourceService, loggerFactory)
        {
        }

        public override Task<IActionResult> PatchAsync(string id, [FromBody] SyncJobResource entity)
        {
            throw UnsupportedRequestMethodException();
        }

        public override Task<IActionResult> PatchRelationshipsAsync(string id, string relationshipName,
            [FromBody] List<DocumentData> relationships)
        {
            throw UnsupportedRequestMethodException();
        }
    }
}
