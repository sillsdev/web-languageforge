using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectUserResource : Identifiable<string>, IResource
    {
        [Attr("role", isImmutable: true)]
        public string Role { get; set; }

        public string UserRef { get; set; }
        public string ProjectRef { get; set; }
    }
}
