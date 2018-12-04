using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectUserResource : ProjectUserResource
    {
        [Attr]
        public TranslateProjectUserConfig TranslateConfig { get; set; }

        [HasOne(withForeignKey: nameof(UserRef))]
        public SFUserResource User { get; set; }

        [HasOne(withForeignKey: nameof(ProjectRef))]
        public SFProjectResource Project { get; set; }
    }
}
