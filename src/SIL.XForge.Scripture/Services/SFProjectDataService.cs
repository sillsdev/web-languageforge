using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public abstract class SFProjectDataService<TResource, TEntity>
        : ProjectDataService<TResource, TEntity, SFProjectEntity>
        where TResource : ProjectDataResource
        where TEntity : ProjectDataEntity
    {
        protected SFProjectDataService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TEntity> entities, IRepository<SFProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor, entities, projects)
        {
        }
    }
}
