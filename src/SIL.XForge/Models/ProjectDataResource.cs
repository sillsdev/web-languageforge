using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectDataResource : Resource
    {
        public const string ProjectRelationship = "project";

        [HasOne(ProjectRelationship)]
        public ProjectResource Project { get; set; }
    }
}
