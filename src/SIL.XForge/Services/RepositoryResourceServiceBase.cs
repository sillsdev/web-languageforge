using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
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
            if (!await Entities.InsertAsync(entity))
                throw new JsonApiException(StatusCodes.Status409Conflict,
                    "Another entity with the same key already exists.");
            return await Entities.GetAsync(entity.Id);
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
            catch (MongoCommandException e)
            {
                if ("DuplicateKey".Equals(e.CodeName))
                    throw new JsonApiException(StatusCodes.Status409Conflict,
                        "Another entity with the same key already exists.", e);
                throw;
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
            Expression<Func<TEntity, object>> field = GetField(name);
            // by default, resource attribute names are the same as entity property names
            if (value == null)
                update.Unset(field);
            else
                update.Set(field, value);
        }

        protected IRelationship<TEntity> ManyToOne<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TEntity, string>> getFieldExpr, bool updateAllowed = true)
                where TOtherResource : class, IResource
                where TOtherEntity : class, IEntity
        {
            return new ManyToOneRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, getFieldExpr,
                updateAllowed);
        }

        protected IRelationship<TEntity> OneToMany<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TOtherEntity, string>> getFieldExpr)
                where TOtherResource : class, IResource
                where TOtherEntity : class, IEntity
        {
            return new OneToManyRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, getFieldExpr);
        }

        protected IRelationship<TEntity> Custom<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Func<TEntity, Expression<Func<TOtherEntity, bool>>> createPredicate,
            Action<IUpdateBuilder<TEntity>, IEnumerable<string>> update = null)
                where TOtherResource : class, IResource
                where TOtherEntity : class, IEntity
        {
            return new CustomRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, createPredicate,
                update);
        }

        private static Expression<Func<TEntity, object>> GetField(string fieldName)
        {
            ParameterExpression param = Expression.Parameter(typeof(TEntity), "e");
            Expression body = Expression.Convert(Expression.Property(param, fieldName), typeof(object));
            return Expression.Lambda<Func<TEntity, object>>(body, param);
        }
    }
}
