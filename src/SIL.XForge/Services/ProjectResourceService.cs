using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ProjectResourceService : ProjectResourceService<ProjectResource, ProjectEntity>
    {
        public ProjectResourceService(IJsonApiContext jsonApiContext, IRepository<ProjectEntity> projects,
            IRepository<ProjectEntity> entities, IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, projects, entities, mapper, httpContextAccessor)
        {
        }
    }

    public class ProjectResourceService<TResource, TEntity> : ProjectDataResourceServiceBase<TResource, TEntity>
        where TResource : ProjectResource
        where TEntity : ProjectEntity
    {
        public ProjectResourceService(IJsonApiContext jsonApiContext, IRepository<ProjectEntity> projects,
            IRepository<TEntity> entities, IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, projects, entities, mapper, httpContextAccessor)
        {
        }

        public IResourceQueryable<UserResource, UserEntity> UserResources { get; set; }

        protected override bool HasOwner => true;
        protected override Domain Domain => Domain.Projects;

        protected override async Task<object> GetRelationshipResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TEntity entity, string relationshipName)
        {
            switch (relationshipName)
            {
                case ProjectResource.OwnerRelationship:
                    return (await UserResources.QueryAsync(included, resources,
                        query => query.Where(u => u.Id == entity.OwnerRef))).SingleOrDefault();

            }
            return base.GetRelationshipResourcesAsync(included, resources, entity, relationshipName);
        }

        protected override UpdateDefinition<TEntity> GetRelationshipUpdateOperation(
            UpdateDefinitionBuilder<TEntity> update, string relationshipName, IEnumerable<string> ids)
        {
            switch (relationshipName)
            {
                case ProjectResource.OwnerRelationship:
                    return update.Set(p => p.OwnerRef, ids.First());
            }
            return base.GetRelationshipUpdateOperation(update, relationshipName, ids);
        }

        protected override void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
            entity.OwnerRef = resource.Owner?.Id;
        }

        protected override Expression<Func<TEntity, bool>> IsOwnedByUser()
        {
            return p => p.OwnerRef == UserId;
        }

        protected override Expression<Func<TEntity, bool>> IsInProject(string projectId)
        {
            return p => p.Id == projectId;
        }

        protected override Expression<Func<TEntity, string>> ProjectRef()
        {
            return p => p.Id;
        }

        protected override string GetProjectId(TResource resource)
        {
            return resource.Id;
        }
    }
}
