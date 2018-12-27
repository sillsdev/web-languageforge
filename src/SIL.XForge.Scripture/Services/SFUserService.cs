using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFUserService : UserService<SFUserResource>
    {
        public SFUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<UserEntity> users, IOptions<SiteOptions> options)
            : base(jsonApiContext, mapper, userAccessor, users, options)
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
