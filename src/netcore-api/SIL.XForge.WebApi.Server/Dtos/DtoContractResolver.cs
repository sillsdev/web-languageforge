using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SIL.XForge.WebApi.Server.Dtos
{
    public class DtoContractResolver : CamelCasePropertyNamesContractResolver
    {
        public static DtoContractResolver Instance { get; } = new DtoContractResolver();

        protected override IList<JsonProperty> CreateProperties(Type type, MemberSerialization memberSerialization)
        {
            IList<JsonProperty> props = base.CreateProperties(type, memberSerialization);
            if (props != null)
                return props.OrderBy(p => InheritanceDepth(p.DeclaringType)).ToList();
            return props;
        }

        private static int InheritanceDepth(Type type)
        {
            int depth = 0;
            while (type != null)
            {
                depth++;
                type = type.BaseType;
            }
            return depth;
        }
    }
}
