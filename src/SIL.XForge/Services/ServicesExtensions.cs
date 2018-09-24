using System.Linq;
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
    }
}
