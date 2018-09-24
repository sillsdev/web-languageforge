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
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class ResourceServiceBase<TResource, TEntity> : IResourceService<TResource, string>,
        IResourceMapper<TResource, TEntity>
        where TResource : Resource
        where TEntity : Entity
    {
        private readonly IJsonApiContext _jsonApiContext;
        private readonly IMapper _mapper;
        private readonly IUserAccessor _userAccessor;

        protected ResourceServiceBase(IJsonApiContext jsonApiContext, IRepository<TEntity> entities, IMapper mapper,
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
            entity = await InsertEntityAsync(entity);
            return await MapAsync(entity);
        }

        public async Task<TResource> UpdateAsync(string id, TResource resource)
        {
            await CheckCanUpdateAsync(id);

            Dictionary<string, object> attrs = _jsonApiContext.AttributesToUpdate
                .ToDictionary(kvp => kvp.Key.InternalAttributeName, kvp => kvp.Value);
            Dictionary<string, string> relationships = _jsonApiContext.RelationshipsToUpdate
                .ToDictionary(kvp => kvp.Key.InternalRelationshipName, kvp => (string) kvp.Value);
            TEntity entity = await UpdateEntityAsync(id, attrs, relationships);
            return _mapper.Map<TResource>(entity);
        }

        public async Task UpdateRelationshipsAsync(string id, string relationshipName,
            List<DocumentData> relationships)
        {
            await CheckCanUpdateAsync(id);

            string propertyName = _jsonApiContext.ContextGraph.GetRelationshipName<TResource>(relationshipName);
            if (propertyName == null)
                throw NotFoundException();
            IEnumerable<string> relationshipIds = relationships.Select(r => r?.Id?.ToString());
            IRelationship<TEntity> relationship = GetRelationship(propertyName);
            TEntity entity = await UpdateEntityRelationshipAsync(id, relationship, relationshipIds);
            if (entity == null)
                throw NotFoundException();
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await CheckCanDeleteAsync(id);

            return await DeleteEntityAsync(id);
        }

        public async Task<IEnumerable<TResource>> GetAsync()
        {
            IQueryable<TEntity> query = Entities.Query();
            query = await ApplyPermissionFilterAsync(query);
            query = ApplySortAndFilterQuery(query);
            query = await ApplyPageQueryAsync(query);
            return await query.ToListAsync(MapAsync);
        }

        public async Task<TResource> GetAsync(string id)
        {
            TEntity entity = await GetEntityAsync(id);
            if (entity == null)
                return null;
            return await MapAsync(entity);
        }

        public async Task<object> GetRelationshipAsync(string id, string relationshipName)
        {
            TEntity entity = await GetEntityAsync(id);
            if (entity == null)
                return null;
            RelationshipAttribute relAttr = _jsonApiContext.ContextGraph
                .GetRelationshipAttribute<TResource>(relationshipName);
            if (relAttr == null)
                throw NotFoundException();
            object value = await GetRelationshipResourcesAsync(relAttr, Enumerable.Empty<string>(),
                new Dictionary<string, Resource>(), entity);
            return value;
        }

        public Task<object> GetRelationshipsAsync(string id, string relationshipName)
        {
            return GetRelationshipAsync(id, relationshipName);
        }

        private Task<TResource> MapAsync(TEntity entity)
        {
            return MapAsync(_jsonApiContext.QuerySet?.IncludedRelationships,
                new Dictionary<string, Resource>(), entity);
        }

        public async Task<TResource> MapAsync(IEnumerable<string> included,
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
                    RelationshipAttribute relAttr = _jsonApiContext.ContextGraph
                        .GetRelationshipAttribute<TResource>(relationshipName);
                    object value = await GetRelationshipResourcesAsync(relAttr, relParts.Skip(1), resources, entity);
                    PropertyInfo propertyInfo = typeof(TResource).GetProperty(relAttr.InternalRelationshipName);
                    propertyInfo.SetValue(resource, value);
                }
            }
            return resource;
        }

        public async Task<IEnumerable<TResource>> MapMatchingAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources,
            Func<IQueryable<TEntity>, IQueryable<TEntity>> querySelector)
        {
            IQueryable<TEntity> query = Entities.Query();
            query = await ApplyPermissionFilterAsync(query);
            query = querySelector(query);
            return await query.ToListAsync(e => MapAsync(included, resources, e));
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
                    foreach (KeyValuePair<string, object> attr in attrs)
                        update.Set(attr.Key, attr.Value);

                    foreach (KeyValuePair<string, string> rel in relationships)
                    {
                        IRelationship<TEntity> relationship = GetRelationship(rel.Key);
                        if (!relationship.Update(update, new[] { rel.Value }))
                        {
                            string relName = _jsonApiContext.ContextGraph.GetPublicRelationshipName<TResource>(rel.Key);
                            throw new JsonApiException(StatusCodes.Status400BadRequest,
                                $"The relationship '{relName}' cannot be updated.");
                        }
                    }
                });
        }

        protected virtual Task<TEntity> UpdateEntityRelationshipAsync(string id, IRelationship<TEntity> relationship,
            IEnumerable<string> relationshipIds)
        {
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
        protected abstract Task CheckCanCreateAsync(TResource resource);
        protected abstract Task CheckCanUpdateAsync(string id);
        protected abstract Task CheckCanDeleteAsync(string id);
        protected abstract Task<IQueryable<TEntity>> ApplyPermissionFilterAsync(IQueryable<TEntity> query);

        protected IRelationship<TEntity> ManyToManyPrimary<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TEntity, List<string>>> getFieldExpr, bool updateAllowed = true)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new ManyToManyPrimaryRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper,
                getFieldExpr, updateAllowed);
        }

        protected IRelationship<TEntity> ManyToManyForeign<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TOtherEntity, List<string>>> getFieldExpr)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new ManyToManyForeignRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper,
                getFieldExpr);
        }

        protected IRelationship<TEntity> ManyToOne<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TEntity, string>> getFieldExpr, bool updateAllowed = true)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new ManyToOneRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, getFieldExpr,
                updateAllowed);
        }

        protected IRelationship<TEntity> OneToMany<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TOtherEntity, string>> getFieldExpr)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new OneToManyRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, getFieldExpr);
        }

        protected IRelationship<TEntity> Custom<TOtherResource, TOtherEntity>(
            IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Func<TEntity, Expression<Func<TOtherEntity, bool>>> createPredicate,
            Action<IUpdateBuilder<TEntity>, IEnumerable<string>> update = null)
                where TOtherResource : Resource
                where TOtherEntity : Entity
        {
            return new CustomRelationship<TEntity, TOtherResource, TOtherEntity>(otherResourceMapper, createPredicate,
                update);
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

        protected JsonApiException UnsupportedRequestMethodException()
        {
            return new JsonApiException(StatusCodes.Status405MethodNotAllowed, "Request method is not supported.",
                "https://json-api-dotnet.github.io/#/errors/UnSupportedRequestMethod");
        }

        private IQueryable<TEntity> ApplySortAndFilterQuery(IQueryable<TEntity> entities)
        {
            QuerySet query = _jsonApiContext.QuerySet;

            if (_jsonApiContext.QuerySet == null)
                return entities;

            if (query.Filters != null && query.Filters.Count > 0)
            {
                foreach (FilterQuery filter in query.Filters)
                    entities = entities.Filter(_jsonApiContext, filter);
            }

            if (query.SortParameters != null && query.SortParameters.Count > 0)
                entities = entities.Sort(query.SortParameters);

            return entities;
        }

        private async Task<IQueryable<TEntity>> ApplyPageQueryAsync(IQueryable<TEntity> entities)
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
                    entities = entities.PageForward(pageManager.PageSize, pageManager.CurrentPage);
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
            IQueryable<TEntity> query = Entities.Query().Where(e => e.Id == id);
            query = await ApplyPermissionFilterAsync(query);
            return await query.SingleOrDefaultAsync();
        }

        private async Task<object> GetRelationshipResourcesAsync(RelationshipAttribute relAttr,
            IEnumerable<string> included, Dictionary<string, Resource> resources, TEntity entity)
        {
            IRelationship<TEntity> relationship = GetRelationship(relAttr.InternalRelationshipName);
            IEnumerable<Resource> relResources = await relationship.GetResourcesAsync(included, resources, entity);
            if (relAttr.IsHasMany)
                return relResources.ToArray();
            return relResources.SingleOrDefault();
        }
    }
}
