using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectDataResource : Resource
    {
        public const string ProjectRelationship = "project";
        public const string OwnerRelationship = "owner";

        [HasOne(ProjectRelationship, withForeignKey: nameof(ProjectRef))]
        public ProjectResource Project { get; set; }
        public string ProjectRef { get; set; }

        [HasOne(OwnerRelationship, withForeignKey: nameof(OwnerRef))]
        public UserResource Owner { get; set; }
        public string OwnerRef { get; set; }
    }
}
