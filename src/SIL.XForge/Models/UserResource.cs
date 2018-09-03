using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class UserResource : Resource
    {
        public const string ProjectsRelationship = "projects";

        [Attr("username")]
        public string Username { get; set; }
        [Attr("name")]
        public string Name { get; set; }
        [Attr("email")]
        public string Email { get; set; }
        [HasMany(ProjectsRelationship)]
        public IReadOnlyList<ProjectResource> Projects { get; set; }
    }
}
