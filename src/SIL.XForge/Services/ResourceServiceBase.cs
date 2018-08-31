using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Security.Claims;
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
        where TResource : class, IResource
        where TEntity : class, IEntity
    {
        private readonly IJsonApiContext _jsonApiContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ResourceServiceBase(IJsonApiContext jsonApiContext, IRepository<TEntity> entities, IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _jsonApiContext = jsonApiContext;
            Entities = entities;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        protected IRepository<TEntity> Entities { get; }
        private ClaimsPrincipal User => _httpContextAccessor.HttpContext.User;
        protected string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        private string SystemRole => User.FindFirst(ClaimTypes.Role)?.Value;
        private string SiteRole => User.FindFirst("site_role")?.Value;

        protected abstract Domain Domain { get; }
        protected virtual bool HasOwner => false;

        public virtual async Task<TResource> CreateAsync(TResource resource)
        {
            await CheckCreateRightAsync(resource);

            var entity = _mapper.Map<TEntity>(resource);
            SetNewEntityRelationships(entity, resource);
            await Entities.InsertAsync(entity);
            entity = await Entities.GetAsync(entity.Id);
            return await MapWithRelationshipsAsync(entity);
        }

        public virtual async Task<bool> DeleteAsync(string id)
        {
            await CheckUpdateDeleteRightAsync(Operation.Delete, id);

            return (await Entities.DeleteAsync(id)) != null;
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
            return await MapWithRelationshipsAsync(entity);
        }

        public async Task<object> GetRelationshipAsync(string id, string relationshipName)
        {
            TEntity entity = await GetEntityAsync(id);
            return GetRelationshipResourcesAsync(entity, relationshipName);
        }

        public Task<object> GetRelationshipsAsync(string id, string relationshipName)
        {
            return GetRelationshipAsync(id, relationshipName);
        }

        public virtual async Task<TResource> UpdateAsync(string id, TResource resource)
        {
            await CheckUpdateDeleteRightAsync(Operation.Edit, id);

            TEntity entity = await Entities.UpdateAsync(e => e.Id == id, update =>
                {
                    var updates = new List<UpdateDefinition<TEntity>>();
                    foreach (KeyValuePair<AttrAttribute, object> attr in _jsonApiContext.AttributesToUpdate)
                        updates.Add(update.Set(attr.Key.InternalAttributeName, attr.Value));

                    foreach (KeyValuePair<RelationshipAttribute, object> rel in _jsonApiContext.RelationshipsToUpdate)
                    {
                        updates.Add(GetRelationshipUpdateOperation(update, rel.Key.PublicRelationshipName,
                            new[] { (string) rel.Value }));
                    }

                    return update.Combine(updates);
                });
            return _mapper.Map<TResource>(entity);
        }

        public virtual async Task UpdateRelationshipsAsync(string id, string relationshipName,
            List<DocumentData> relationships)
        {
            await CheckUpdateDeleteRightAsync(Operation.Edit, id);

            IEnumerable<string> relationshipIds = relationships.Select(r => r?.Id?.ToString());
            await Entities.UpdateAsync(e => e.Id == id,
                update => GetRelationshipUpdateOperation(update, relationshipName, relationshipIds));
        }

        public async Task<IEnumerable<TResource>> QueryAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources,
            Func<IMongoQueryable<TEntity>, IMongoQueryable<TEntity>> querySelector)
        {
            IMongoQueryable<TEntity> query = Entities.Query();
            query = await ApplyRightFilterAsync(query);
            query = querySelector(query);
            return await query.ToListAsync(e => MapWithRelationshipsAsync(included, resources, e));
        }

        protected Task<object> GetRelationshipResourcesAsync(TEntity entity, string relationshipName)
        {
            return GetRelationshipResourcesAsync(Enumerable.Empty<string>(), new Dictionary<string, IResource>(),
                entity, relationshipName);
        }

        protected virtual Task<object> GetRelationshipResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TEntity entity, string relationshipName)
        {
            throw new JsonApiException(StatusCodes.Status422UnprocessableEntity,
                $"Relationship '{relationshipName}' does not exist on resource '{typeof(TResource)}'.");
        }

        protected virtual UpdateDefinition<TEntity> GetRelationshipUpdateOperation(UpdateDefinitionBuilder<TEntity> update,
            string relationshipName, IEnumerable<string> ids)
        {
            throw new JsonApiException(StatusCodes.Status422UnprocessableEntity,
                $"Relationship '{relationshipName}' does not exist on resource '{typeof(TResource)}'.");
        }

        protected virtual void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
        }

        protected virtual Expression<Func<TEntity, bool>> IsOwnedByUser()
        {
            throw new NotImplementedException();
        }

        protected virtual Task<bool> HasCreateRightAsync(TResource resource)
        {
            return Task.FromResult(HasSiteRight(new Right(Domain, Operation.Create)));
        }

        protected virtual async Task<bool> HasUpdateDeleteRightAsync(Operation op, string id)
        {
            if (HasSiteRight(new Right(Domain, op)))
                return true;

            if (HasOwner)
            {
                if (HasSiteRight(GetOwnRight(op)) && await IsOwned(id))
                    return true;
            }
            return false;
        }

        protected virtual Task<Expression<Func<TEntity, bool>>> GetRightFilterAsync()
        {
            Expression<Func<TEntity, bool>> filter = null;
            if (HasSiteRight(new Right(Domain, Operation.View)))
                filter = e => true;
            if (HasOwner && HasSiteRight(GetOwnRight(Operation.View)))
                filter = IsOwnedByUser();
            return Task.FromResult(filter);
        }

        private async Task CheckCreateRightAsync(TResource resource)
        {
            if (!await HasCreateRightAsync(resource))
            {
                throw new JsonApiException(StatusCodes.Status403Forbidden,
                    "The specified user does not have permission to perform this operation.");
            }
        }

        private async Task CheckUpdateDeleteRightAsync(Operation op, string id)
        {
            if (!await HasUpdateDeleteRightAsync(op, id))
            {
                throw new JsonApiException(StatusCodes.Status403Forbidden,
                    "The specified user does not have permission to perform this operation.");
            }
        }

        private async Task<IMongoQueryable<TEntity>> ApplyRightFilterAsync(IMongoQueryable<TEntity> query)
        {
            return query.Where((await GetRightFilterAsync()) ?? (e => false));
        }

        protected Task<bool> IsOwned(string id)
        {
            return Entities.Query().Where(e => e.Id == id).Where(IsOwnedByUser()).AnyAsync();
        }

        protected Right GetOwnRight(Operation op)
        {
            Operation ownOp;
            switch (op)
            {
                case Operation.View:
                    ownOp = Operation.ViewOwn;
                    break;
                case Operation.Delete:
                    ownOp = Operation.DeleteOwn;
                    break;
                case Operation.Edit:
                    ownOp = Operation.EditOwn;
                    break;
                default:
                    throw new InvalidEnumArgumentException(nameof(op), (int) op, typeof(Operation));
            }
            return new Right(Domain, ownOp);
        }

        private bool HasSiteRight(Right right)
        {
            return SystemRoles.Instance.HasRight(SystemRole, right) || SiteRoles.Instance.HasRight(SiteRole, right);
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
            TEntity entity = await query.SingleOrDefaultAsync();
            if (entity == null)
                throw new JsonApiException(StatusCodes.Status404NotFound, "The specified resource does not exist.");
            return entity;
        }

        private Task<TResource> MapWithRelationshipsAsync(TEntity entity)
        {
            return MapWithRelationshipsAsync(_jsonApiContext.QuerySet?.IncludedRelationships,
                new Dictionary<string, IResource>(), entity);
        }

        private async Task<TResource> MapWithRelationshipsAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TEntity entity)
        {
            if (resources.TryGetValue(entity.Id, out IResource existing))
                return (TResource) existing;

            TResource resource = _mapper.Map<TResource>(entity);
            resources[entity.Id] = resource;

            if (included != null)
            {
                foreach (string relationship in included)
                {
                    string[] relParts = relationship.Split('.');
                    string relationshipName = relParts[0];
                    string propertyName = _jsonApiContext.ContextGraph.GetRelationshipName<TResource>(relationshipName);
                    PropertyInfo propertyInfo = resource.GetType().GetProperty(propertyName);
                    object value = await GetRelationshipResourcesAsync(relParts.Skip(1), resources, entity,
                        relationshipName);
                    propertyInfo.SetValue(resource, value);
                }
            }
            return resource;
        }
    }
}
