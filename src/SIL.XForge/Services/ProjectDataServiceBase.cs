using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
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
            IRepository<TEntity> entities, IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
            _projects = projects;
        }

        public IResourceQueryable<TProjectResource, TProjectEntity> ProjectResources { get; set; }

        protected override IRelationship<TEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case ProjectDataResource.ProjectRelationship:
                    return ManyToOne(ProjectResources, ProjectRef());
            }
            return base.GetRelationship(relationshipName);
        }

        protected override void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
            base.SetNewEntityRelationships(entity, resource);
            if (resource.Project != null)
                entity.ProjectRef = resource.Project.Id;
        }

        protected override async Task<bool> HasCreateRightAsync(TResource resource)
        {
            if (await base.HasCreateRightAsync(resource))
                return true;

            if (resource.Project == null)
                return false;

            ProjectEntity project = await _projects.GetAsync(resource.Project.Id);
            return project.HasRight(UserId, new Right(Domain, Operation.Create));
        }

        protected override async Task<bool> HasUpdateDeleteRightAsync(Operation op, string id)
        {
            if (await base.HasUpdateDeleteRightAsync(op, id))
                return true;

            ProjectEntity project = await Entities.Query().Where(e => e.Id == id)
                .Join(_projects.Query(), ProjectRef(), p => p.Id, (e, p) => p).SingleOrDefaultAsync();
            if (project.HasRight(UserId, new Right(Domain, op)))
                return true;

            if (HasOwner)
            {
                if (project.HasRight(UserId, GetOwnRight(op)) && await IsOwned(id))
                    return true;
            }

            return false;
        }

        protected override async Task<Expression<Func<TEntity, bool>>> GetRightFilterAsync()
        {
            Expression<Func<TEntity, bool>> filter = await base.GetRightFilterAsync();
            if (filter != null)
                return filter;

            List<TProjectEntity> projects = await _projects.Query().Where(p => p.Users.ContainsKey(UserId))
                .ToListAsync();
            var wherePredicate = PredicateBuilder.New<TEntity>();
            bool isEmpty = true;
            foreach (TProjectEntity project in projects)
            {
                if (project.HasRight(UserId, new Right(Domain, Operation.View)))
                {
                    wherePredicate.Or(IsInProject(project.Id));
                    isEmpty = false;
                }
                else if (HasOwner && project.HasRight(UserId, GetOwnRight(Operation.View)))
                {
                    wherePredicate.Or(IsInProject(project.Id).And(IsOwnedByUser()));
                    isEmpty = false;
                }
            }
            return isEmpty ? null : wherePredicate;
        }

        protected virtual Expression<Func<TEntity, bool>> IsInProject(string projectId)
        {
            return e => e.ProjectRef == projectId;
        }

        protected virtual Expression<Func<TEntity, string>> ProjectRef()
        {
            return e => e.ProjectRef;
        }
    }
}
