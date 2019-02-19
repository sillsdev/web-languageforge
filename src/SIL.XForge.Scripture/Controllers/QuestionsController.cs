using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Logging;
using SIL.XForge.Controllers;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Controllers
{
    public class QuestionsController : JsonApiControllerBase<QuestionResource>
    {
        public QuestionsController(IJsonApiContext jsonApiContext,
            IResourceService<QuestionResource, string> resourceService, ILoggerFactory loggerFactory)
            : base(jsonApiContext, resourceService, loggerFactory)
        {
        }
    }
}
