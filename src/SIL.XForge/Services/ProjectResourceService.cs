using System;
using System.Linq.Expressions;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ProjectResourceService<TResource, TEntity>
        : ProjectDataResourceServiceBase<TResource, TEntity, TEntity>
        where TResource : ProjectResource
        where TEntity : ProjectEntity
    {
        public ProjectResourceService(IJsonApiContext jsonApiContext, IRepository<TEntity> entities,
            IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, entities, mapper, httpContextAccessor)
        {
        }

        public IResourceQueryable<UserResource, UserEntity> UserResources { get; set; }

        protected override bool HasOwner => true;
        protected override Domain Domain => Domain.Projects;

        protected override IRelationship<TEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case ProjectResource.OwnerRelationship:
                    return ManyToOne(UserResources, (TEntity p) => p.OwnerRef);
            }
            return base.GetRelationship(relationshipName);
        }

        protected override void SetNewEntityRelationships(TEntity entity, TResource resource)
        {
            if (resource.Owner != null)
                entity.OwnerRef = resource.Owner.Id;
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
