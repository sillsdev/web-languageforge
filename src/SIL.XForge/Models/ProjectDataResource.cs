using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public abstract class ProjectDataResource : Resource
    {
        public string ProjectRef { get; set; }
        public string OwnerRef { get; set; }

        [HasOne(withForeignKey: nameof(OwnerRef))]
        public UserResource Owner { get; set; }

        [HasOne(withForeignKey: nameof(ProjectRef))]
        public ProjectResource Project { get; set; }
    }
}
