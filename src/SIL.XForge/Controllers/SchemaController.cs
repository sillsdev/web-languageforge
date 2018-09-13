using Microsoft.AspNetCore.Mvc;
using SIL.XForge.Models;

namespace SIL.XForge.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SchemaController : ControllerBase
    {
        private readonly ResourceSchema _schema;

        public SchemaController(ResourceSchema schema)
        {
            _schema = schema;
        }

        [HttpGet]
        public ActionResult<ResourceSchema> Get()
        {
            return _schema;
        }
    }
}
