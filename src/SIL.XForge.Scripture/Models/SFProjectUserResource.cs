using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectUserResource : ProjectUserResource
    {
        [Attr]
        public string SelectedTask { get; set; }
        [Attr]
        public TranslateProjectUserConfig TranslateConfig { get; set; }
    }
}
