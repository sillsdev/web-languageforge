using System.Linq;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Services
{
    public static class ServicesExtensions
    {
        public static string GetPublicRelationshipName<T>(this IContextGraph contextGraph,
            string internalPropertyName)
        {
            ContextEntity contextEntity = contextGraph.GetContextEntity(typeof(T));
            return contextEntity.Relationships
                .SingleOrDefault(r => r.InternalRelationshipName == internalPropertyName)?.PublicRelationshipName;
        }

        public static RelationshipAttribute GetRelationshipAttribute<T>(this IContextGraph contextGraph,
            string publicRelationshipName)
        {
            ContextEntity contextEntity = contextGraph.GetContextEntity(typeof(T));
            return contextEntity.Relationships.SingleOrDefault(r => r.Is(publicRelationshipName));
        }

        public static void IgnoreAllUnmapped(this IMapperConfigurationExpression cfg)
        {
            cfg.ForAllMaps((map, expr) =>
                {
                    foreach (string propName in map.GetUnmappedPropertyNames())
                    {
                        if (map.SourceType.GetProperty(propName) != null)
                            expr.ForSourceMember(propName, opt => opt.Ignore());
                        if (map.DestinationType.GetProperty(propName) != null)
                            expr.ForMember(propName, opt => opt.Ignore());
                    }
                });
        }
    }
}
