using System.Collections.Generic;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ProjectResource : ResourceBase
    {
        public const string OwnerRelationship = "owner";

        [Attr("project-name")]
        public string ProjectName { get; set; }
        [Attr("project-code")]
        public string ProjectCode { get; set; }
        [Attr("users")]
        public IDictionary<string, ProjectRole> Users { get; set; }
        [HasOne(OwnerRelationship)]
        public UserResource Owner { get; set; }
    }
}
