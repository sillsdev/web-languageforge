using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    [Resource("project-users")]
    public abstract class ProjectUserResource : Identifiable<string>, IResource
    {
        [Attr]
        public string Role { get; set; }

        public string UserRef { get; set; }
        public string ProjectRef { get; set; }
    }
}
