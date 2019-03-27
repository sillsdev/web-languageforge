using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using LinqKit;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class ProjectDataService<TResource, TEntity, TProjectEntity>
        : RepositoryResourceServiceBase<TResource, TEntity>, IProjectDataMapper<TResource, TEntity>
        where TResource : ProjectDataResource
        where TEntity : ProjectDataEntity
        where TProjectEntity : ProjectEntity
    {
        protected ProjectDataService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TEntity> entities, IRepository<TProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor, entities)
        {
            Projects = projects;
        }

        protected abstract int Domain { get; }
        protected IRepository<TProjectEntity> Projects { get; }

        public IResourceMapper<ProjectResource, ProjectEntity> ProjectMapper { get; set; }
        public IResourceMapper<UserResource, UserEntity> UserMapper { get; set; }

        public virtual Task DeleteAllAsync(string projectId)
        {
            return Entities.DeleteAllAsync(e => e.ProjectRef == projectId);
        }

        protected override IRelationship<TEntity> GetRelationship(string propertyName)
        {
            switch (propertyName)
            {
                case nameof(ProjectDataResource.Project):
                    return HasOne(ProjectMapper, ProjectRef(), false);
                case nameof(ProjectDataResource.Owner):
                    return HasOne(UserMapper, (TEntity p) => p.OwnerRef, false);
            }
            return base.GetRelationship(propertyName);
        }

        protected override async Task CheckCanCreateAsync(TResource resource)
        {
            if (string.IsNullOrEmpty(resource.ProjectRef))
                throw new JsonApiException(StatusCodes.Status400BadRequest, "The project is not defined.");
            if (string.IsNullOrEmpty(resource.OwnerRef))
                throw new JsonApiException(StatusCodes.Status400BadRequest, "The owner is not defined.");
            if (resource.OwnerRef != UserId)
                throw new JsonApiException(StatusCodes.Status400BadRequest, "The owner is not the current user.");

            TProjectEntity project = await Projects.GetAsync(resource.ProjectRef);
            if (HasRight(project, Operation.Create))
                return;

            throw ForbiddenException();
        }

        protected override Task CheckCanUpdateAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            return CheckCanUpdateDeleteAsync(id, Operation.Edit, Operation.EditOwn);
        }

        protected override Task CheckCanUpdateRelationshipAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id, Operation.Edit, Operation.EditOwn);
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id, Operation.Delete, Operation.DeleteOwn);
        }

        protected override async Task<IQueryable<TEntity>> ApplyPermissionFilterAsync(IQueryable<TEntity> query)
        {
            IEnumerable<TProjectEntity> projects = await GetProjectsAsync();
            var wherePredicate = PredicateBuilder.New<TEntity>();
            bool isEmpty = true;
            foreach (TProjectEntity project in projects)
            {
                if (HasRight(project, Operation.View))
                {
                    wherePredicate.Or(IsInProject(project.Id));
                    isEmpty = false;
                }
                else if (HasRight(project, Operation.ViewOwn))
                {
                    wherePredicate.Or(IsInProject(project.Id).And(IsOwnedByUser()));
                    isEmpty = false;
                }
            }
            if (isEmpty)
                return query.Where(e => false);
            return query.Where(wherePredicate);
        }

        protected Expression<Func<TEntity, string>> ProjectRef()
        {
            return e => e.ProjectRef;
        }

        private async Task<IEnumerable<TProjectEntity>> GetProjectsAsync()
        {
            return await Projects.Query().Where(p => p.Users.Any(u => u.UserRef == UserId)).ToListAsync();
        }

        private async Task CheckCanUpdateDeleteAsync(string id, Operation op, Operation ownOp)
        {
            TProjectEntity project = await Entities.Query().Where(e => e.Id == id)
                .Join(Projects.Query(), ProjectRef(), p => p.Id, (e, p) => p).SingleOrDefaultAsync();

            if (HasRight(project, op))
                return;

            if (HasRight(project, ownOp) && await IsOwnedAsync(id))
                return;

            throw ForbiddenException();
        }

        private Expression<Func<TEntity, bool>> IsInProject(string projectId)
        {
            return e => e.ProjectRef == projectId;
        }

        private bool HasRight(TProjectEntity project, Operation op)
        {
            return project.HasRight(UserId, new Right(Domain, op));
        }

        private Expression<Func<TEntity, bool>> IsOwnedByUser()
        {
            return e => e.OwnerRef == UserId;
        }

        private Task<bool> IsOwnedAsync(string id)
        {
            return Entities.Query().Where(e => e.Id == id).Where(IsOwnedByUser()).AnyAsync();
        }
    }
}
