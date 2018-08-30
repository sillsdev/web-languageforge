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
    public class UserResourceService : ResourceServiceBase<UserResource, UserEntity>
    {
        public UserResourceService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities, IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
        }

        public ProjectResourceService ProjectResources { get; set; }

        protected override bool HasOwner => true;
        protected override Domain Domain => Domain.Users;

        protected override async Task<object> GetRelationshipResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, UserEntity entity, string relationshipName)
        {
            switch (relationshipName)
            {
                case UserResource.ProjectsRelationship:
                    return await ProjectResources.QueryAsync(included, resources,
                        query => query.Where(p => entity.Projects.Contains(p.Id)));
            }

            return await base.GetRelationshipResourcesAsync(included, resources, entity, relationshipName);
        }

        protected override UpdateDefinition<UserEntity> GetRelationshipUpdateOperation(
            UpdateDefinitionBuilder<UserEntity> update, string relationshipName, IEnumerable<string> ids)
        {
            switch (relationshipName)
            {
                case UserResource.ProjectsRelationship:
                    return update.Set(u => u.Projects, ids.ToList());
            }
            return base.GetRelationshipUpdateOperation(update, relationshipName, ids);
        }

        protected override Expression<Func<UserEntity, bool>> IsOwnedByUser()
        {
            return u => u.Id == UserId;
        }
    }
}
