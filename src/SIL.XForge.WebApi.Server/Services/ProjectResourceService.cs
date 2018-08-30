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
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Services
{
    public class ProjectResourceService : ProjectDataResourceServiceBase<ProjectResource, ProjectEntity>
    {
        public ProjectResourceService(IJsonApiContext jsonApiContext, IRepository<ProjectEntity> projects,
            IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, projects, projects, mapper, httpContextAccessor)
        {
        }

        public UserResourceService UserResources { get; set; }

        protected override bool HasOwner => true;
        protected override Domain Domain => Domain.Projects;

        protected override async Task<object> GetRelationshipResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, ProjectEntity entity, string relationshipName)
        {
            switch (relationshipName)
            {
                case ProjectResource.OwnerRelationship:
                    return (await UserResources.QueryAsync(included, resources,
                        query => query.Where(u => u.Id == entity.OwnerRef))).SingleOrDefault();

            }
            return base.GetRelationshipResourcesAsync(included, resources, entity, relationshipName);
        }

        protected override UpdateDefinition<ProjectEntity> GetRelationshipUpdateOperation(
            UpdateDefinitionBuilder<ProjectEntity> update, string relationshipName, IEnumerable<string> ids)
        {
            switch (relationshipName)
            {
                case ProjectResource.OwnerRelationship:
                    return update.Set(p => p.OwnerRef, ids.First());
            }
            return base.GetRelationshipUpdateOperation(update, relationshipName, ids);
        }

        protected override void SetNewEntityRelationships(ProjectEntity entity, ProjectResource resource)
        {
            entity.OwnerRef = resource.Owner?.Id;
        }

        protected override Expression<Func<ProjectEntity, bool>> IsOwnedByUser()
        {
            return p => p.OwnerRef == UserId;
        }

        protected override Expression<Func<ProjectEntity, bool>> IsInProject(string projectId)
        {
            return p => p.Id == projectId;
        }

        protected override Expression<Func<ProjectEntity, string>> ProjectRef()
        {
            return p => p.Id;
        }

        protected override string GetProjectId(ProjectResource resource)
        {
            return resource.Id;
        }
    }
}
