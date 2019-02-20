using System;
using System.Linq;
using System.Reflection;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Services
{
    public class XFResourceGraphBuilder : ResourceGraphBuilder
    {
        protected override Type GetRelationshipType(RelationshipAttribute relation, PropertyInfo prop)
        {
            Type type = base.GetRelationshipType(relation, prop);
            if (type.IsAbstract)
            {
                type = Assembly.GetEntryAssembly().GetTypes()
                    .FirstOrDefault(t => type.IsAssignableFrom(t) && !t.IsAbstract);
            }
            return type;
        }
    }
}
