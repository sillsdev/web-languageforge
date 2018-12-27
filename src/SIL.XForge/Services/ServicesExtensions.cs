using System.Linq;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Services
{
    public static class ServicesExtensions
    {
        public static string GetPublicRelationshipName<T>(this IResourceGraph resourceGraph,
            string internalPropertyName)
        {
            ContextEntity contextEntity = resourceGraph.GetContextEntity(typeof(T));
            return contextEntity.Relationships
                .SingleOrDefault(r => r.InternalRelationshipName == internalPropertyName)?.PublicRelationshipName;
        }

        public static RelationshipAttribute GetRelationshipAttribute<T>(this IResourceGraph resourceGraph,
            string publicRelationshipName)
        {
            ContextEntity contextEntity = resourceGraph.GetContextEntity(typeof(T));
            return contextEntity.Relationships.SingleOrDefault(r => r.Is(publicRelationshipName));
        }
    }
}
