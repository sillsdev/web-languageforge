using JsonApiDotNetCore.Models;
using Newtonsoft.Json;

namespace SIL.XForge.Services
{
    public class XFRelationshipData : RelationshipData
    {
        [JsonIgnore]
        public bool IsHasOne { get; set; }
    }
}
