using System;
using System.Linq.Expressions;
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

        protected override bool HasOwner => true;
        protected override Domain Domain => Domain.Users;

        protected override IRelationship<UserEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case UserResource.ProjectsRelationship:
                    return Custom(ProjectResources,
                        (UserEntity u) => { return p => p.Users.ContainsKey(u.Id); });
            }
            return base.GetRelationship(relationshipName);
        }

        protected override Expression<Func<UserEntity, bool>> IsOwnedByUser()
        {
            return u => u.Id == UserId;
        }
    }
}
