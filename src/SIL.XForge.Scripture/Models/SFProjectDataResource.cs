using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectDataResource : ProjectDataResource
    {
        [HasOne("owner", withForeignKey: nameof(OwnerRef))]
        public SFUserResource Owner { get; set; }

        [HasOne("project", withForeignKey: nameof(ProjectRef))]
        public SFProjectResource Project { get; set; }
    }
}
