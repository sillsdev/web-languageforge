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
        where TResource : Resource
        where TEntity : Entity
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

        public IResourceQueryable<UserResource, UserEntity> UserResources { get; set; }

        protected IRepository<TEntity> Entities { get; }
        private ClaimsPrincipal User => _httpContextAccessor.HttpContext.User;
        protected string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        private string SystemRole => User.FindFirst(ClaimTypes.Role)?.Value;
        private string SiteRole => User.FindFirst("site_role")?.Value;

        protected abstract Domain Domain { get; }
        protected virtual bool HasOwner => true;

        public async Task<TResource> CreateAsync(TResource resource)
        {
            await CheckCreateRightAsync(resource);

            var entity = _mapper.Map<TEntity>(resource);
            SetNewEntityRelationships(entity, resource);
            entity = await InsertEntityAsync(entity);
            return await MapWithRelationshipsAsync(entity);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            await CheckUpdateDeleteRightAsync(Operation.Delete, id);

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

        public async Task<TResource> UpdateAsync(string id, TResource resource)
        {
            await CheckUpdateDeleteRightAsync(Operation.Edit, id);

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
            await CheckUpdateDeleteRightAsync(Operation.Edit, id);

            IEnumerable<string> relationshipIds = relationships.Select(r => r?.Id?.ToString());
            IRelationship<TEntity> relationship = GetRelationship(relationshipName);
            await UpdateEntityRelationshipAsync(id, relationship, relationshipIds);
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

        protected Task<object> GetRelationshipResourcesAsync(TEntity entity, string relationshipName)
        {
            IRelationship<TEntity> relationship = GetRelationship(relationshipName);
            return relationship.GetResourcesAsync(Enumerable.Empty<string>(), new Dictionary<string, Resource>(),
                entity);
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
            switch (relationshipName)
            {
                case Resource.OwnerRelationship:
                    return ManyToOne(UserResources, (TEntity p) => p.OwnerRef);
            }
            throw new JsonApiException(StatusCodes.Status422UnprocessableEntity,
                $"Relationship '{relationshipName}' does not exist on resource '{typeof(TResource)}'.");
        }

        protected virtual void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
            if (resource.Owner != null)
                entity.OwnerRef = resource.Owner.Id;
        }

        protected virtual Expression<Func<TEntity, bool>> IsOwnedByUser()
        {
            return e => e.OwnerRef == UserId;
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
            else if (HasOwner && HasSiteRight(GetOwnRight(Operation.View)))
                filter = IsOwnedByUser();
            return Task.FromResult(filter);
        }

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
                    IRelationship<TEntity> relationship = GetRelationship(relationshipName);
                    string propertyName = _jsonApiContext.ContextGraph.GetRelationshipName<TResource>(relationshipName);
                    PropertyInfo propertyInfo = resource.GetType().GetProperty(propertyName);
                    object value = await relationship.GetResourcesAsync(relParts.Skip(1), resources, entity);
                    propertyInfo.SetValue(resource, value);
                }
            }
            return resource;
        }
    }
}
