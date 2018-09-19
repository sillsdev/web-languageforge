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
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class ProjectDataServiceBase<TResource, TEntity, TProjectResource, TProjectEntity>
        : ResourceServiceBase<TResource, TEntity>
        where TResource : ProjectDataResource
        where TEntity : ProjectDataEntity
        where TProjectResource : ProjectResource
        where TProjectEntity : ProjectEntity
    {
        private readonly IRepository<TProjectEntity> _projects;

        public ProjectDataServiceBase(IJsonApiContext jsonApiContext, IRepository<TProjectEntity> projects,
            IRepository<TEntity> entities, IMapper mapper, IUserAccessor userAccessor)
            : base(jsonApiContext, entities, mapper, userAccessor)
        {
            _projects = projects;
        }

        public IResourceQueryable<TProjectResource, TProjectEntity> ProjectResources { get; set; }
        public IResourceQueryable<UserResource, UserEntity> UserResources { get; set; }

        protected abstract Domain Domain { get; }

        protected override IRelationship<TEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case ProjectDataResource.ProjectRelationship:
                    return ManyToOne(ProjectResources, ProjectRef());
                case ProjectDataResource.OwnerRelationship:
                    return ManyToOne(UserResources, (TEntity p) => p.OwnerRef);
            }
            return base.GetRelationship(relationshipName);
        }

        protected override void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
            base.SetNewEntityRelationships(entity, resource);
            if (resource.Project != null)
                entity.ProjectRef = resource.Project.Id;
            entity.OwnerRef = UserId;
        }

        protected override async Task CheckCanCreateAsync(TResource resource)
        {
            if (resource.Project == null)
                throw new JsonApiException(StatusCodes.Status400BadRequest, "The project relationship is not defined.");

            ProjectEntity project = await _projects.GetAsync(resource.Project.Id);
            if (HasRight(project, Operation.Create))
                return;

            throw ForbiddenException();
        }

        protected override Task CheckCanUpdateAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id, Operation.Edit, Operation.EditOwn);
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateDeleteAsync(id, Operation.Delete, Operation.DeleteOwn);
        }

        protected override async Task<Expression<Func<TEntity, bool>>> GetRightFilterAsync()
        {
            List<TProjectEntity> projects = await _projects.Query().Where(p => p.Users.ContainsKey(UserId))
                .ToListAsync();
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
            return isEmpty ? null : wherePredicate;
        }

        private async Task CheckCanUpdateDeleteAsync(string id, Operation op, Operation ownOp)
        {
            ProjectEntity project = await Entities.Query().Where(e => e.Id == id)
                .Join(_projects.Query(), ProjectRef(), p => p.Id, (e, p) => p).SingleOrDefaultAsync();

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

        private Expression<Func<TEntity, string>> ProjectRef()
        {
            return e => e.ProjectRef;
        }

        private bool HasRight(ProjectEntity project, Operation op)
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
