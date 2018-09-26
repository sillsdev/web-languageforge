using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFUserService : UserService<SFUserResource>
    {
        public SFUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<UserEntity> users) : base(jsonApiContext, mapper, userAccessor, users)
        {
        }

        public IResourceMapper<SFProjectUserResource, SFProjectUserEntity> ProjectUserMapper { get; set; }

        protected override IRelationship<UserEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case nameof(SFUserResource.Projects):
                    return OneToMany(ProjectUserMapper, u => u.UserRef);
            }
            return base.GetRelationship(relationshipName);
        }
    }
}
