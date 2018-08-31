using System;
using System.Reflection;
using JsonApiDotNetCore.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace SIL.XForge.Services
{
    public class XForgeDasherizedResolver : CamelCasePropertyNamesContractResolver
    {
        protected override JsonProperty CreateProperty(MemberInfo member, MemberSerialization memberSerialization)
        {
            JsonProperty property = base.CreateProperty(member, memberSerialization);
            if (Attribute.IsDefined(member, typeof(JsonPropertyAttribute)))
            {
                property.PropertyName = property.PropertyName.Dasherize();
            }
            return property;
        }
    }
}
