using Microsoft.AspNetCore.Mvc;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchemaController : ControllerBase
    {
        private readonly SchemaResourceService _schemaResourceService;

        public SchemaController(SchemaResourceService schemaResourceService)
        {
            _schemaResourceService = schemaResourceService;
        }

        [HttpGet]
        public ActionResult<SchemaResource> Get()
        {
            return _schemaResourceService.Get();
        }
    }
}
