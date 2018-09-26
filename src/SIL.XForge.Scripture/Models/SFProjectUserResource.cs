using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectUserResource : ProjectUserResource
    {
        [Attr("translate-config")]
        public TranslateProjectUserConfig TranslateConfig { get; set; }

        [HasOne("user", withForeignKey: nameof(UserRef))]
        public SFUserResource User { get; set; }

        [HasOne("project", withForeignKey: nameof(ProjectRef))]
        public SFProjectResource Project { get; set; }
    }
}
