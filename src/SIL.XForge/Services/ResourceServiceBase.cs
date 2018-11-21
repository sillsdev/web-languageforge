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
        where TResource : class, IResource
        where TEntity : class, IEntity
    {
        private readonly IMapper _mapper;
        private readonly IUserAccessor _userAccessor;

        protected ResourceServiceBase(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor)
        {
            JsonApiContext = jsonApiContext;
            _mapper = mapper;
            _userAccessor = userAccessor;
        }

        protected IJsonApiContext JsonApiContext { get; }
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
            Dictionary<string, object> attrs = JsonApiContext.AttributesToUpdate
                .ToDictionary(kvp => kvp.Key.InternalAttributeName, kvp => kvp.Value);
            Dictionary<string, string> relationships = JsonApiContext.RelationshipsToUpdate
                .ToDictionary(kvp => kvp.Key.InternalRelationshipName, kvp => (string) kvp.Value);
            await CheckCanUpdateAsync(id, attrs, relationships);

            TEntity entity = await UpdateEntityAsync(id, attrs, relationships);
            return _mapper.Map<TResource>(entity);
        }

        public async Task UpdateRelationshipsAsync(string id, string relationshipName,
            List<DocumentData> relationships)
        {
            await CheckCanUpdateRelationshipAsync(id);

            string propertyName = JsonApiContext.ContextGraph.GetRelationshipName<TResource>(relationshipName);
            if (propertyName == null)
                throw NotFoundException();
            IEnumerable<string> relationshipIds = relationships.Select(r => r?.Id?.ToString());
            TEntity entity = await UpdateEntityRelationshipAsync(id, propertyName, relationshipIds);
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
            IQueryable<TEntity> query = GetEntityQueryable();
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
            RelationshipAttribute relAttr = JsonApiContext.ContextGraph
                .GetRelationshipAttribute<TResource>(relationshipName);
            if (relAttr == null)
                throw NotFoundException();
            object value = await GetRelationshipResourcesAsync(relAttr, Enumerable.Empty<string>(),
                new Dictionary<string, IResource>(), entity);
            return value;
        }

        public Task<object> GetRelationshipsAsync(string id, string relationshipName)
        {
            return GetRelationshipAsync(id, relationshipName);
        }

        private Task<TResource> MapAsync(TEntity entity)
        {
            return MapAsync(JsonApiContext.QuerySet?.IncludedRelationships,
                new Dictionary<string, IResource>(), entity);
        }

        public async Task<TResource> MapAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TEntity entity)
        {
            if (resources.TryGetValue(entity.Id, out IResource existing))
                return (TResource) existing;

            TResource resource = _mapper.Map<TResource>(entity);
            resources[entity.Id] = resource;

            if (included != null)
            {
                foreach (string fullName in included)
                {
                    string[] relParts = fullName.Split('.');
                    string relationshipName = relParts[0];
                    RelationshipAttribute relAttr = JsonApiContext.ContextGraph
                        .GetRelationshipAttribute<TResource>(relationshipName);
                    object value = await GetRelationshipResourcesAsync(relAttr, relParts.Skip(1), resources, entity);
                    PropertyInfo propertyInfo = typeof(TResource).GetProperty(relAttr.InternalRelationshipName);
                    propertyInfo.SetValue(resource, value);
                }
            }
            return resource;
        }

        public async Task<IEnumerable<TResource>> MapMatchingAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, Expression<Func<TEntity, bool>> predicate)
        {
            IQueryable<TEntity> query = GetEntityQueryable();
            query = await ApplyPermissionFilterAsync(query);
            query = query.Where(predicate);
            return await query.ToListAsync(e => MapAsync(included, resources, e));
        }

        protected abstract Task CheckCanCreateAsync(TResource resource);
        protected abstract Task CheckCanUpdateAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships);
        protected abstract Task CheckCanUpdateRelationshipAsync(string id);
        protected abstract Task CheckCanDeleteAsync(string id);
        protected abstract Task<IQueryable<TEntity>> ApplyPermissionFilterAsync(IQueryable<TEntity> query);
        protected abstract Task<TEntity> InsertEntityAsync(TEntity entity);
        protected abstract Task<TEntity> UpdateEntityAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships);
        protected abstract Task<TEntity> UpdateEntityRelationshipAsync(string id, string propertyName,
            IEnumerable<string> relationshipIds);
        protected abstract Task<bool> DeleteEntityAsync(string id);
        protected abstract IQueryable<TEntity> GetEntityQueryable();
        protected abstract Task<object> GetRelationshipResourcesAsync(RelationshipAttribute relAttr,
            IEnumerable<string> included, Dictionary<string, IResource> resources, TEntity entity);

        protected virtual IQueryable<TEntity> ApplyFilter(IQueryable<TEntity> entities, FilterQuery filter)
        {
            return entities.Filter(JsonApiContext, filter);
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
            QuerySet query = JsonApiContext.QuerySet;

            if (JsonApiContext.QuerySet == null)
                return entities;

            if (query.Filters != null && query.Filters.Count > 0)
            {
                foreach (FilterQuery filter in query.Filters)
                    entities = ApplyFilter(entities, filter);
            }

            if (query.SortParameters != null && query.SortParameters.Count > 0)
                entities = entities.Sort(query.SortParameters);

            return entities;
        }

        private async Task<IQueryable<TEntity>> ApplyPageQueryAsync(IQueryable<TEntity> entities)
        {
            PageManager pageManager = JsonApiContext.PageManager;
            if (pageManager.IsPaginated)
            {
                int count = -1;
                if (JsonApiContext.Options.IncludeTotalRecordCount)
                {
                    count = await entities.CountAsync();
                    JsonApiContext.PageManager.TotalRecords = count;
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
            IQueryable<TEntity> query = GetEntityQueryable().Where(e => e.Id == id);
            query = await ApplyPermissionFilterAsync(query);
            return await query.SingleOrDefaultAsync();
        }
    }
}
