using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class ResourceSchema
    {
        public int Version { get; set; }
        public IDictionary<string, ResourceSchemaModel> Models { get; set; }
    }
}
