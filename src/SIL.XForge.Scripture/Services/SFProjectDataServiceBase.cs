using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public abstract class SFProjectDataServiceBase<TResource, TEntity>
        : ProjectDataServiceBase<TResource, TEntity, SFProjectEntity>
        where TResource : SFProjectDataResource
        where TEntity : ProjectDataEntity
    {
        protected SFProjectDataServiceBase(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TEntity> entities, IRepository<SFProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor, entities, projects)
        {
        }

        public IResourceMapper<SFProjectResource, SFProjectEntity> ProjectMapper { get; set; }
        public IResourceMapper<SFUserResource, UserEntity> UserMapper { get; set; }

        protected override IRelationship<TEntity> GetRelationship(string propertyName)
        {
            switch (propertyName)
            {
                case nameof(SFProjectDataResource.Project):
                    return ManyToOne(ProjectMapper, ProjectRef(), false);
                case nameof(SFProjectDataResource.Owner):
                    return ManyToOne(UserMapper, (TEntity p) => p.OwnerRef, false);
            }
            return base.GetRelationship(propertyName);
        }

        protected override async Task<IEnumerable<SFProjectEntity>> GetProjectsAsync()
        {
            return await Projects.Query().Where(p => p.Users.Any(u => u.UserRef == UserId)).ToListAsync();
        }
    }
}
