using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class SchemaModel
    {
        public IDictionary<string, SchemaAttribute> Attributes { get; set; }
        public IDictionary<string, SchemaRelationship> Relationships { get; set; }
    }
}
