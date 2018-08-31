using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectResourceService
        : ProjectResourceService<SFProjectResource, SFProjectEntity>
    {
        public SFProjectResourceService(IJsonApiContext jsonApiContext,
            IRepository<SFProjectEntity> entities, IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, entities, mapper, httpContextAccessor)
        {
        }
    }
}
