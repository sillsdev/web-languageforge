using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectDataResource : Resource
    {
        [HasOne("project", withForeignKey: nameof(ProjectRef))]
        public ProjectResource Project { get; set; }
        public string ProjectRef { get; set; }

        [HasOne("owner", withForeignKey: nameof(OwnerRef))]
        public UserResource Owner { get; set; }
        public string OwnerRef { get; set; }
    }
}
