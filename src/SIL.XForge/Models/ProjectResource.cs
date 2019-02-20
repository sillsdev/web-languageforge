using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    [Resource("projects")]
    public abstract class ProjectResource : Resource
    {
        [Attr]
        public string ProjectName { get; set; }
        [Attr]
        public InputSystem InputSystem { get; set; }

        [HasMany]
        [SchemaInfo(Inverse = nameof(ProjectUserResource.Project), IsDependent = true)]
        public IReadOnlyList<ProjectUserResource> Users { get; set; }
    }
}
