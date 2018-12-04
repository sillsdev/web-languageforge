using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public abstract class SFProjectDataResource : ProjectDataResource
    {
        [HasOne(withForeignKey: nameof(OwnerRef))]
        public SFUserResource Owner { get; set; }

        [HasOne(withForeignKey: nameof(ProjectRef))]
        public SFProjectResource Project { get; set; }
    }
}
