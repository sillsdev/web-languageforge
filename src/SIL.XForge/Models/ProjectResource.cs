using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    [Resource("projects")]
    public abstract class ProjectResource : Resource
    {
        [Attr]
        public string ProjectName { get; set; }
    }
}
