using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class ResourceServiceBase<TResource, TEntity> : IResourceService<TResource, string>,
        IResourceQueryable<TResource, TEntity>
        where TResource : Resource
        where TEntity : Entity
    {
        private readonly IJsonApiContext _jsonApiContext;
        private readonly IMapper _mapper;
        private readonly IUserAccessor _userAccessor;

        public ResourceServiceBase(IJsonApiContext jsonApiContext, IRepository<TEntity> entities, IMapper mapper,
            IUserAccessor userAccessor)
        {
            _jsonApiContext = jsonApiContext;
            Entities = entities;
            _mapper = mapper;
            _userAccessor = userAccessor;
        }

        protected IRepository<TEntity> Entities { get; }
        protected string UserId => _userAccessor.UserId;
        protected string SystemRole => _userAccessor.SystemRole;

        public async Task<TResource> CreateAsync(TResource resource)
        {
            await CheckCanCreateAsync(resource);

            var entity = _mapper.Map<TEntity>(resource);
            SetNewEntityRelationships(entity, resource);
            entity = await InsertEntityAsync(entity);
            return await MapWithRelationshipsAsync(entity);
        }

        public async Task<TResource> UpdateAsync(string id, TResource resource)
        {
            await CheckCanUpdateAsync(id);

            Dictionary<string, object> attrs = _jsonApiContext.AttributesToUpdate
                .ToDictionary(kvp => kvp.Key.InternalAttributeName, kvp => kvp.Value);
            Dictionary<string, string> relationships = _jsonApiContext.RelationshipsToUpdate
                .ToDictionary(kvp => kvp.Key.PublicRelationshipName, kvp => (string) kvp.Value);
            TEntity entity = await UpdateEntityAsync(id, attrs, relationships);
            return _mapper.Map<TResource>(entity);
        }

        public async Task UpdateRelationshipsAsync(string id, string relationshipName,
            List<DocumentData> relationships)
        {
            await CheckCanUpdateAsync(id);

            IEnumerable<string> relationshipIds = relationships.Select(r => r?.Id?.ToString());
            IRelationship<TEntity> relationship = GetRelationship(relationshipName);
            await UpdateEntityRelationshipAsync(id, relationship, relationshipIds);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await CheckCanDeleteAsync(id);

            return await DeleteEntityAsync(id);
        }

        public async Task<IEnumerable<TResource>> GetAsync()
        {
            IMongoQueryable<TEntity> query = Entities.Query();
            query = await ApplyRightFilterAsync(query);
            query = ApplySortAndFilterQuery(query);
            query = await ApplyPageQueryAsync(query);
            return await query.ToListAsync(MapWithRelationshipsAsync);
        }

        public async Task<TResource> GetAsync(string id)
        {
            TEntity entity = await GetEntityAsync(id);
            if (entity == null)
                return null;
            return await MapWithRelationshipsAsync(entity);
        }

        public async Task<object> GetRelationshipAsync(string id, string relationshipName)
        {
            TEntity entity = await GetEntityAsync(id);
            if (entity == null)
                return null;
            (_, object value) = await GetRelationshipResourcesAsync(relationshipName, Enumerable.Empty<string>(),
                new Dictionary<string, Resource>(), entity);
            return value;
        }

        public Task<object> GetRelationshipsAsync(string id, string relationshipName)
        {
            return GetRelationshipAsync(id, relationshipName);
        }

        public async Task<IEnumerable<TResource>> QueryAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources,
            Func<IMongoQueryable<TEntity>, IMongoQueryable<TEntity>> querySelector)
        {
            IMongoQueryable<TEntity> query = Entities.Query();
            query = await ApplyRightFilterAsync(query);
            query = querySelector(query);
            return await query.ToListAsync(e => MapWithRelationshipsAsync(included, resources, e));
        }

        protected virtual async Task<TEntity> InsertEntityAsync(TEntity entity)
        {
            await Entities.InsertAsync(entity);
            return await Entities.GetAsync(entity.Id);
        }

        protected virtual async Task<bool> DeleteEntityAsync(string id)
        {
            return (await Entities.DeleteAsync(id)) != null;
        }

        protected virtual Task<TEntity> UpdateEntityAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            return Entities.UpdateAsync(e => e.Id == id, update =>
                {
                    var updates = new List<UpdateDefinition<TEntity>>();
                    foreach (KeyValuePair<string, object> attr in attrs)
                        updates.Add(update.Set(attr.Key, attr.Value));

                    foreach (KeyValuePair<string, string> rel in relationships)
                    {
                        IRelationship<TEntity> relationship = GetRelationship(rel.Key);
                        updates.Add(relationship.GetUpdateOperation(update, new[] { rel.Value }));
                    }

                    return update.Combine(updates);
                });
        }

        protected virtual Task UpdateEntityRelationshipAsync(string id, IRelationship<TEntity> relationship,
            IEnumerable<string> relationshipIds)
        {
            return Entities.UpdateAsync(e => e.Id == id,
                update => relationship.GetUpdateOperation(update, relationshipIds));
        }

        protected virtual IRelationship<TEntity> GetRelationship(string relationshipName)
        {
            throw new JsonApiException(StatusCodes.Status422UnprocessableEntity,
                $"Relationship '{relationshipName}' does not exist on resource '{typeof(TResource)}'.");
        }

        protected virtual void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
        }

        protected abstract Task CheckCanCreateAsync(TResource resource);
        protected abstract Task CheckCanUpdateAsync(string id);
        protected abstract Task CheckCanDeleteAsync(string id);
        protected abstract Task<Expression<Func<TEntity, bool>>> GetRightFilterAsync();

        protected IRelationship<TEntity> ManyToManyThis<TOtherResource, TOtherEntity>(
            IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Expression<Func<TEntity, List<string>>> getFieldExpr)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new ManyToManyThisRelationship<TEntity, TOtherResource, TOtherEntity>(otherResources,
                getFieldExpr);
        }

        protected IRelationship<TEntity> ManyToManyOther<TOtherResource, TOtherEntity>(
            IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Expression<Func<TOtherEntity, List<string>>> getFieldExpr)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new ManyToManyOtherRelationship<TEntity, TOtherResource, TOtherEntity>(otherResources,
                getFieldExpr);
        }

        protected IRelationship<TEntity> ManyToOne<TOtherResource, TOtherEntity>(
            IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Expression<Func<TEntity, string>> getFieldExpr)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new ManyToOneRelationship<TEntity, TOtherResource, TOtherEntity>(otherResources, getFieldExpr);
        }

        protected IRelationship<TEntity> OneToMany<TOtherResource, TOtherEntity>(
            IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Expression<Func<TOtherEntity, string>> getFieldExpr)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new OneToManyRelationship<TEntity, TOtherResource, TOtherEntity>(otherResources, getFieldExpr);
        }

        protected IRelationship<TEntity> Custom<TOtherResource, TOtherEntity>(
            IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Func<TEntity, Expression<Func<TOtherEntity, bool>>> createPredicate,
            Func<UpdateDefinitionBuilder<TEntity>, IEnumerable<string>, UpdateDefinition<TEntity>> createOperation = null)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new CustomRelationship<TEntity, TOtherResource, TOtherEntity>(otherResources, createPredicate,
                createOperation);
        }

        protected JsonApiException ForbiddenException()
        {
            return new JsonApiException(StatusCodes.Status403Forbidden,
                "The specified user does not have permission to perform this operation.");
        }

        protected JsonApiException NotFoundException()
        {
            return new JsonApiException(StatusCodes.Status404NotFound, "The resource could not be found.");
        }

        private async Task<IMongoQueryable<TEntity>> ApplyRightFilterAsync(IMongoQueryable<TEntity> query)
        {
            return query.Where((await GetRightFilterAsync()) ?? (e => false));
        }

        private IMongoQueryable<TEntity> ApplySortAndFilterQuery(IMongoQueryable<TEntity> entities)
        {
            QuerySet query = _jsonApiContext.QuerySet;

            if (_jsonApiContext.QuerySet == null)
                return entities;

            if (query.Filters.Count > 0)
            {
                foreach (FilterQuery filter in query.Filters)
                    entities = (IMongoQueryable<TEntity>) entities.Filter(_jsonApiContext, filter);
            }

            if (query.SortParameters != null && query.SortParameters.Count > 0)
                entities = (IMongoQueryable<TEntity>) entities.Sort(query.SortParameters);

            return entities;
        }

        private async Task<IMongoQueryable<TEntity>> ApplyPageQueryAsync(IMongoQueryable<TEntity> entities)
        {
            PageManager pageManager = _jsonApiContext.PageManager;
            if (pageManager.IsPaginated)
            {
                int count = -1;
                if (_jsonApiContext.Options.IncludeTotalRecordCount)
                {
                    count = await entities.CountAsync();
                    _jsonApiContext.PageManager.TotalRecords = count;
                }

                if (pageManager.CurrentPage >= 0)
                {
                    entities = (IMongoQueryable<TEntity>) entities.PageForward(pageManager.PageSize,
                        pageManager.CurrentPage);
                }
                else
                {
                    if (count < 0)
                        count = await entities.CountAsync();

                    // may be negative
                    int virtualFirstIndex = count - pageManager.PageSize * Math.Abs(pageManager.CurrentPage);
                    int numberOfElementsInPage = Math.Min(pageManager.PageSize,
                        virtualFirstIndex + pageManager.PageSize);

                    entities = entities.Skip(virtualFirstIndex).Take(numberOfElementsInPage);
                }
            }
            return entities;
        }

        private async Task<TEntity> GetEntityAsync(string id)
        {
            IMongoQueryable<TEntity> query = Entities.Query().Where(e => e.Id == id);
            query = await ApplyRightFilterAsync(query);
            return await query.SingleOrDefaultAsync();
        }

        private Task<TResource> MapWithRelationshipsAsync(TEntity entity)
        {
            return MapWithRelationshipsAsync(_jsonApiContext.QuerySet?.IncludedRelationships,
                new Dictionary<string, Resource>(), entity);
        }

        private async Task<TResource> MapWithRelationshipsAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TEntity entity)
        {
            if (resources.TryGetValue(entity.Id, out Resource existing))
                return (TResource) existing;

            TResource resource = _mapper.Map<TResource>(entity);
            resources[entity.Id] = resource;

            if (included != null)
            {
                foreach (string fullName in included)
                {
                    string[] relParts = fullName.Split('.');
                    string relationshipName = relParts[0];
                    (string propertyName, object value) = await GetRelationshipResourcesAsync(relationshipName,
                        relParts.Skip(1), resources, entity);
                    PropertyInfo propertyInfo = typeof(TResource).GetProperty(propertyName);
                    propertyInfo.SetValue(resource, value);
                }
            }
            return resource;
        }

        private async Task<(string, object)> GetRelationshipResourcesAsync(string relationshipName,
            IEnumerable<string> included, Dictionary<string, Resource> resources, TEntity entity)
        {
            IRelationship<TEntity> relationship = GetRelationship(relationshipName);
            IEnumerable<Resource> relResources = await relationship.GetResourcesAsync(included, resources, entity);
            ContextEntity resourceType = _jsonApiContext.ContextGraph.GetContextEntity(typeof(TResource));
            RelationshipAttribute relAttr = resourceType.Relationships
                .Single(r => r.PublicRelationshipName == relationshipName);
            if (relAttr.IsHasMany)
                return (relAttr.InternalRelationshipName, relResources.ToArray());
            return (relAttr.InternalRelationshipName, relResources.SingleOrDefault());
        }
    }
}
