using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using MongoDB.Driver;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ResourceSchemaService
    {
        public const int Version = 1;

        private static readonly Type[] DictionaryInterfaces =
        {
            typeof(IDictionary<,>),
            typeof(IDictionary),
            typeof(IReadOnlyDictionary<,>)
        };

        private readonly HashSet<string> _types;

        public ResourceSchemaService(IEnumerable<string> types, IContextGraph contextGraph)
        {
            _types = new HashSet<string>(types);
            ContextGraph = contextGraph;
        }

        public IContextGraph ContextGraph { get; }

        public ResourceSchema Get()
        {
            var models = new Dictionary<string, ResourceSchemaModel>();
            foreach (ContextEntity resourceType in _types.Select(t => ContextGraph.GetContextEntity(t)))
                models[Singularize(resourceType.EntityName)] = CreateModel(resourceType);
            return new ResourceSchema
            {
                Version = Version,
                Models = models
            };
        }

        private ResourceSchemaModel CreateModel(ContextEntity resourceType)
        {
            var attributes = new Dictionary<string, ResourceSchemaAttribute>();
            foreach (AttrAttribute attr in resourceType.Attributes)
                attributes[Camelize(attr.PublicAttributeName)] = CreateAttribute(resourceType, attr);

            var relationships = new Dictionary<string, ResourceSchemaRelationship>();
            foreach (RelationshipAttribute relationship in resourceType.Relationships)
            {
                if (resourceType.EntityName == "users"
                    && relationship.PublicRelationshipName == Resource.OwnerRelationship)
                {
                    continue;
                }
                if (resourceType.EntityName == "projects"
                    && relationship.PublicRelationshipName == ProjectDataResource.ProjectRelationship)
                {
                    continue;
                }
                relationships[Camelize(relationship.PublicRelationshipName)] = CreateRelationship(resourceType,
                    relationship);
            }

            return new ResourceSchemaModel
            {
                Attributes = attributes,
                Relationships = relationships
            };
        }

        private ResourceSchemaAttribute CreateAttribute(ContextEntity resourceType, AttrAttribute attr)
        {
            PropertyInfo pi = resourceType.EntityType.GetProperty(attr.InternalAttributeName);
            string type = "object";
            switch (Type.GetTypeCode(pi.PropertyType))
            {
                case TypeCode.String:
                case TypeCode.Char:
                    type = "string";
                    break;
                case TypeCode.Boolean:
                    type = "boolean";
                    break;
                case TypeCode.Byte:
                case TypeCode.SByte:
                case TypeCode.UInt16:
                case TypeCode.UInt32:
                case TypeCode.UInt64:
                case TypeCode.Int16:
                case TypeCode.Int32:
                case TypeCode.Int64:
                case TypeCode.Decimal:
                case TypeCode.Double:
                case TypeCode.Single:
                    type = "number";
                    break;
                case TypeCode.DateTime:
                    type = "date";
                    break;
                default:
                    if (IsEnumerableType(pi.PropertyType) && !IsDictionaryType(pi.PropertyType))
                        type = "array";
                    break;
            }
            return new ResourceSchemaAttribute { Type = type };
        }

        private ResourceSchemaRelationship CreateRelationship(ContextEntity resourceType, RelationshipAttribute relationship)
        {
            ContextEntity relationshipType;
            if (relationship.Type == typeof(ProjectResource))
                relationshipType = ContextGraph.GetContextEntity("projects");
            else
                relationshipType = ContextGraph.GetContextEntity(relationship.Type);

            RelationshipAttribute inverseRelationship = null;
            if  (relationship.PublicRelationshipName != Resource.OwnerRelationship)
            {
                inverseRelationship = relationshipType.Relationships
                    .FirstOrDefault(r => r.PublicRelationshipName != Resource.OwnerRelationship
                        && r.Type.IsAssignableFrom(resourceType.EntityType));
            }

            return new ResourceSchemaRelationship
            {
                Type = relationship.IsHasMany ? "hasMany" : "hasOne",
                Model = Singularize(relationshipType.EntityName),
                Inverse = Camelize(inverseRelationship?.PublicRelationshipName)
            };
        }

        private static string Singularize(string word)
        {
            if (word == null)
                return null;

            if (word.EndsWith("s"))
                return word.Substring(0, word.Length - 1);
            return word;
        }

        private static string Camelize(string word)
        {
            if (word == null)
                return null;

            var sb = new StringBuilder();
            foreach (string part in word.Split(' ', '.', '_', '-'))
            {
                string newPart = part.ToLowerInvariant();
                if (sb.Length > 0)
                {
                    sb.Append(newPart.Substring(0, 1).ToUpperInvariant());
                    newPart = newPart.Substring(1);
                }
                sb.Append(newPart);
            }
            return sb.ToString();
        }

        private static bool IsEnumerableType(Type type)
        {
            return typeof(IEnumerable).IsAssignableFrom(type);
        }

        private static bool IsDictionaryType(Type type)
        {
            if (type.IsInterface && IsDictionaryInterfaceType(type))
                return true;
            return type.GetInterfaces().Any(t => IsDictionaryInterfaceType(t));
        }

        private static bool IsDictionaryInterfaceType(Type type)
        {
            return DictionaryInterfaces
                .Any(i => i == type || (type.IsGenericType && i == type.GetGenericTypeDefinition()));
        }
    }
}
