using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectDataResource : Resource
    {
        public const string ProjectRelationship = "project";
        public const string OwnerRelationship = "owner";

        [HasOne(ProjectRelationship)]
        public ProjectResource Project { get; set; }

        [HasOne(OwnerRelationship)]
        public UserResource Owner { get; set; }
    }
}
