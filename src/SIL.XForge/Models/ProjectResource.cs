using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectResource : Resource
    {
        [Attr("project-name")]
        public string ProjectName { get; set; }
    }
}
