using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using Humanizer;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class ResourceSchema
    {
        private static readonly Type[] DictionaryInterfaces =
        {
            typeof(IDictionary<,>),
            typeof(IDictionary),
            typeof(IReadOnlyDictionary<,>)
        };

        public static ResourceSchema Build(IResourceGraph resourceGraph,
            IEnumerable<ResourceDescriptor> resourceDescriptors)
        {
            var models = new Dictionary<string, ResourceSchemaModel>();
            foreach (ContextEntity resourceType in resourceDescriptors
                .Select(rd => resourceGraph.GetContextEntity(rd.ResourceType)))
            {
                models[Camelize(resourceType.EntityName.Singularize())] = CreateModel(resourceGraph, resourceType);
            }
            var schema = new ResourceSchema
            {
                Models = models
            };
            return schema;
        }

        private static ResourceSchemaModel CreateModel(IResourceGraph contextGraph, ContextEntity resourceType)
        {
            var attributes = new Dictionary<string, ResourceSchemaAttribute>();
            foreach (AttrAttribute attr in resourceType.Attributes)
                attributes[Camelize(attr.PublicAttributeName)] = CreateAttribute(resourceType, attr);

            var relationships = new Dictionary<string, ResourceSchemaRelationship>();
            foreach (RelationshipAttribute relationship in resourceType.Relationships)
            {
                relationships[Camelize(relationship.PublicRelationshipName)] = CreateRelationship(contextGraph,
                    resourceType, relationship);
            }

            return new ResourceSchemaModel
            {
                Attributes = attributes,
                Relationships = relationships
            };
        }

        private static ResourceSchemaAttribute CreateAttribute(ContextEntity resourceType, AttrAttribute attr)
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

        private static ResourceSchemaRelationship CreateRelationship(IResourceGraph contextGraph,
            ContextEntity resourceType, RelationshipAttribute relationship)
        {
            ContextEntity relationshipType = contextGraph.GetContextEntity(relationship.Type);

            SchemaInfoAttribute schemaInfo = GetSchemaInfo(resourceType, relationship);
            string inverse = null;
            bool isDependent = false;
            if (schemaInfo != null)
            {
                if (schemaInfo.Inverse != null)
                {
                    RelationshipAttribute inverseRelationship = relationshipType.Relationships
                        .FirstOrDefault(r => r.InternalRelationshipName == schemaInfo.Inverse);
                    inverse = inverseRelationship?.PublicRelationshipName;
                }
                isDependent = schemaInfo.IsDependent;
            }

            if (inverse == null)
            {
                // check if the related resource type has a relationship back to this type that is marked as the
                // inverse of the current relationship
                foreach (RelationshipAttribute candidate in relationshipType.Relationships
                    .Where(r => r.Type.IsAssignableFrom(resourceType.EntityType)))
                {
                    SchemaInfoAttribute candidateSchemaInfo = GetSchemaInfo(relationshipType, candidate);
                    if (candidateSchemaInfo?.Inverse == relationship.InternalRelationshipName)
                    {
                        inverse = candidate.PublicRelationshipName;
                        break;
                    }
                }
            }

            return new ResourceSchemaRelationship
            {
                Type = relationship.IsHasMany ? "hasMany" : "hasOne",
                Model = Camelize(relationshipType.EntityName.Singularize()),
                Inverse = Camelize(inverse),
                Dependent = isDependent ? "remove" : null
            };
        }

        private static SchemaInfoAttribute GetSchemaInfo(ContextEntity ce, RelationshipAttribute relationship)
        {
            PropertyInfo pi = ce.EntityType.GetProperty(relationship.InternalRelationshipName);
            return pi.GetCustomAttribute<SchemaInfoAttribute>();
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

        public int Version => 1;
        public IDictionary<string, ResourceSchemaModel> Models { get; set; }
    }
}
