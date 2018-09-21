using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class TestProjectDataResource : ProjectDataResource
    {
        [Attr("str")]
        public string Str { get; set; }
    }
}
