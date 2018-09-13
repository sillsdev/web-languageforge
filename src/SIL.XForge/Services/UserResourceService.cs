using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class UserResourceService<TProjectResource, TProjectEntity> : ResourceServiceBase<UserResource, UserEntity>
        where TProjectResource : ProjectResource
        where TProjectEntity : ProjectEntity
    {
        public UserResourceService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities, IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
        }

        public IResourceQueryable<TProjectResource, TProjectEntity> ProjectResources { get; set; }

        protected override Domain Domain => Domain.Users;

        protected override Task<UserEntity> UpdateEntityAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            if (attrs.TryGetValue(nameof(UserResource.Password), out object value))
                attrs[nameof(UserResource.Password)] = BCrypt.Net.BCrypt.HashPassword((string) value, 7);
            return base.UpdateEntityAsync(id, attrs, relationships);
        }

        protected override IRelationship<UserEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case UserResource.ProjectsRelationship:
                    return Custom(ProjectResources, (UserEntity u) => { return p => p.Users.ContainsKey(u.Id); });
            }
            return base.GetRelationship(relationshipName);
        }

        protected override Expression<Func<UserEntity, bool>> IsOwnedByUser()
        {
            return u => u.Id == UserId;
        }
    }
}
