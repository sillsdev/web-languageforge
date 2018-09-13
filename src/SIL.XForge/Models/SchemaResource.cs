using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class SchemaResource
    {
        public int Version { get; set; }
        public IDictionary<string, SchemaModel> Models { get; set; }
    }
}
