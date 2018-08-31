using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectResource : ProjectResource
    {
        [Attr("config")]
        public SFConfig Config { get; set; }
    }
}
