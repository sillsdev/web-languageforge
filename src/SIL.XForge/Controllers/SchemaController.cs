using Microsoft.AspNetCore.Mvc;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchemaController : ControllerBase
    {
        private readonly ResourceSchemaService _schemaService;

        public SchemaController(ResourceSchemaService schemaService)
        {
            _schemaService = schemaService;
        }

        [HttpGet]
        public ActionResult<ResourceSchema> Get()
        {
            return _schemaService.Get();
        }
    }
}
