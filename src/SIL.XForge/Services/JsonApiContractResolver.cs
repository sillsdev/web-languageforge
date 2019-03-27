using System.Reflection;
using JsonApiDotNetCore.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace SIL.XForge.Services
{
    /// <summary>
    /// This JSON contract resolver is responsible for ensuring that the "data" property of a has-one relationship is
    /// always serialized even if it is null.
    /// </summary>
    public class JsonApiContractResolver : CamelCasePropertyNamesContractResolver
    {
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            JsonProperty property = base.CreateProperty(member, memberSerialization);

            if (property.DeclaringType == typeof(RelationshipData) && property.PropertyName == "data")
            {
                property.NullValueHandling = NullValueHandling.Include;
                property.ShouldSerialize = instance =>
                {
                    var relData = (XFRelationshipData)instance;
                    return relData.IsHasOne || relData.ExposedData != null;
                };
            }

            return property;
        }
    }
}
