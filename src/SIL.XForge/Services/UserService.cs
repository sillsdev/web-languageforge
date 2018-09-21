using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class UserService : UserService<ProjectResource, ProjectEntity>
    {
        public UserService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities, IMapper mapper,
            IUserAccessor userAccessor) : base(jsonApiContext, entities, mapper, userAccessor)
        {
        }
    }

    public class UserService<TProjectResource, TProjectEntity> : ResourceServiceBase<UserResource, UserEntity>
        where TProjectResource : ProjectResource
        where TProjectEntity : ProjectEntity
    {
        public UserService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities, IMapper mapper,
            IUserAccessor userAccessor)
            : base(jsonApiContext, entities, mapper, userAccessor)
        {
        }

        public IResourceMapper<TProjectResource, TProjectEntity> ProjectResourceMapper { get; set; }

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
                    return Custom(ProjectResourceMapper, (UserEntity u) => { return p => p.Users.ContainsKey(u.Id); });
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

        protected override Task<IQueryable<UserEntity>> ApplyPermissionFilterAsync(IQueryable<UserEntity> query)
        {
            if (SystemRole == SystemRoles.User)
                query = query.Where(u => u.Id == UserId);
            return Task.FromResult(query);
        }
    }
}
