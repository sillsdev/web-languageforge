using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public abstract class SFProjectDataServiceBase<TResource, TEntity>
        : ProjectDataServiceBase<TResource, TEntity, SFProjectResource, SFProjectEntity>
        where TResource : ProjectDataResource
        where TEntity : ProjectDataEntity
    {
        public SFProjectDataServiceBase(IJsonApiContext jsonApiContext, IRepository<SFProjectEntity> projects,
            IRepository<TEntity> entities, IMapper mapper, IHttpContextAccessor httpContextAccessor)
            : base(jsonApiContext, projects, entities, mapper, httpContextAccessor)
        {
        }
    }
}
