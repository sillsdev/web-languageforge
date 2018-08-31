using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class ScriptureProjectResource : ProjectResource
    {
        [Attr("config")]
        public ScriptureConfig Config { get; set; }
    }
}
