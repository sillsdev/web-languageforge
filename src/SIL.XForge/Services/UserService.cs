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
    public class UserService<TProjectResource, TProjectEntity> : ResourceServiceBase<UserResource, UserEntity>
        where TProjectResource : ProjectResource
        where TProjectEntity : ProjectEntity
    {
        public UserService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities, IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
        }

        public IResourceQueryable<TProjectResource, TProjectEntity> ProjectResources { get; set; }

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

        protected override Task CheckCanCreateAsync(UserResource resource)
        {
            if (SystemRole == SystemRoles.User)
                throw ForbiddenException();
            return Task.CompletedTask;
        }

        protected override Task CheckCanUpdateAsync(string id)
        {
            if (SystemRole == SystemRoles.User && id != UserId)
                throw ForbiddenException();
            return Task.CompletedTask;
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return CheckCanUpdateAsync(id);
        }

        protected override Task<Expression<Func<UserEntity, bool>>> GetRightFilterAsync()
        {
            Expression<Func<UserEntity, bool>> filter = null;
            switch (SystemRole)
            {
                case SystemRoles.User:
                    filter = (UserEntity u) => u.Id == UserId;
                    break;
                case SystemRoles.SystemAdmin:
                    filter = (UserEntity u) => true;
                    break;
            }
            return Task.FromResult(filter);
        }
    }
}
