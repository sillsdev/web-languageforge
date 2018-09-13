using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class ResourceSchemaModel
    {
        public IDictionary<string, ResourceSchemaAttribute> Attributes { get; set; }
        public IDictionary<string, ResourceSchemaRelationship> Relationships { get; set; }
    }
}
