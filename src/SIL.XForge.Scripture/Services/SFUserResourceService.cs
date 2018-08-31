using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFUserResourceService : UserResourceService<SFProjectResource, SFProjectEntity>
    {
        public SFUserResourceService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities,
            IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
        }
    }
}
