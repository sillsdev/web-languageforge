using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class RepositoryResourceServiceBase<TResource, TEntity> : ResourceServiceBase<TResource, TEntity>
        where TResource : Resource
        where TEntity : Entity
    {
        protected RepositoryResourceServiceBase(IJsonApiContext jsonApiContext, IMapper mapper,
            IUserAccessor userAccessor, IRepository<TEntity> entities) : base(jsonApiContext, mapper, userAccessor)
        {
            Entities = entities;
        }

        protected IRepository<TEntity> Entities { get; }

        protected override async Task<TEntity> InsertEntityAsync(TEntity entity)
        {
            try
            {
                await Entities.InsertAsync(entity);
                return await Entities.GetAsync(entity.Id);
            }
            catch (DuplicateKeyException)
            {
                throw new JsonApiException(StatusCodes.Status409Conflict,
                    "Another entity with the same key already exists.");
            }
        }

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            return (await Entities.DeleteAsync(id)) != null;
        }

        protected override async Task<TEntity> UpdateEntityAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            try
            {
                return await Entities.UpdateAsync(e => e.Id == id, update =>
                {
                    foreach (KeyValuePair<string, object> attr in attrs)
                        UpdateAttribute(update, attr.Key, attr.Value);

                    foreach (KeyValuePair<string, string> rel in relationships)
                    {
                        IRelationship<TEntity> relationship = GetRelationship(rel.Key);
                        if (!relationship.Update(update, new[] { rel.Value }))
                        {
                            string relName = JsonApiContext.ResourceGraph.GetPublicRelationshipName<TResource>(rel.Key);
                            throw new JsonApiException(StatusCodes.Status400BadRequest,
                                $"The relationship '{relName}' cannot be updated.");
                        }
                    }
                });
            }
            catch (DuplicateKeyException)
            {
                throw new JsonApiException(StatusCodes.Status409Conflict,
                    "Another entity with the same key already exists.");
            }
        }

        protected override Task<TEntity> UpdateEntityRelationshipAsync(string id, string propertyName,
            IEnumerable<string> relationshipIds)
        {
            IRelationship<TEntity> relationship = GetRelationship(propertyName);
            return Entities.UpdateAsync(e => e.Id == id, update =>
                {
                    if (!relationship.Update(update, relationshipIds))
                        throw UnsupportedRequestMethodException();
                });
        }

        protected virtual IRelationship<TEntity> GetRelationship(string propertyName)
        {
            return null;
        }

        protected override IQueryable<TEntity> GetEntityQueryable()
        {
            return Entities.Query();
        }

        protected override async Task<object> GetRelationshipResourcesAsync(RelationshipAttribute relAttr,
            IEnumerable<string> included, Dictionary<string, IResource> resources, TEntity entity)
        {
            IRelationship<TEntity> relationship = GetRelationship(relAttr.InternalRelationshipName);
            IEnumerable<IResource> relResources = await relationship.GetResourcesAsync(included, resources, entity);
            if (relAttr.IsHasMany)
            {
                IResource[] resArray = relResources.ToArray();
                var result = Array.CreateInstance(relAttr.Type, resArray.Length);
                resArray.CopyTo(result, 0);
                return result;
            }
            return relResources.SingleOrDefault();
        }

        protected virtual void UpdateAttribute(IUpdateBuilder<TEntity> update, string name, object value)
        {
            // by default, resource attribute names are the same as entity property names
            PropertyInfo propInfo = typeof(TEntity).GetProperty(name);
            LambdaExpression field = GetField(propInfo.PropertyType, name);

            if (value == null)
            {
                MethodInfo unsetMethod = update.GetType().GetMethod("Unset");
                MethodInfo genericUnsetMethod = unsetMethod.MakeGenericMethod(propInfo.PropertyType);
                genericUnsetMethod.Invoke(update, new object[] { field });
            }
            else
            {
                MethodInfo setMethod = update.GetType().GetMethod("Set");
                MethodInfo genericSetMethod = setMethod.MakeGenericMethod(propInfo.PropertyType);
                genericSetMethod.Invoke(update, new object[] { field, value });
            }
        }

        protected IRelationship<TEntity> HasOne<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TEntity, string>> getFieldExpr, bool updateAllowed = true)
                where TOtherResource : class, IResource
                where TOtherEntity : class, IEntity
        {
            return new HasOneRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, getFieldExpr,
                updateAllowed);
        }

        protected IRelationship<TEntity> HasMany<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TOtherEntity, string>> getFieldExpr)
                where TOtherResource : class, IResource
                where TOtherEntity : class, IEntity
        {
            return new HasManyRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, getFieldExpr);
        }

        private static LambdaExpression GetField(Type returnType, string fieldName)
        {
            ParameterExpression param = Expression.Parameter(typeof(TEntity), "e");
            Expression body = Expression.Convert(Expression.Property(param, fieldName), returnType);
            return Expression.Lambda(body, param);
        }
    }
}
