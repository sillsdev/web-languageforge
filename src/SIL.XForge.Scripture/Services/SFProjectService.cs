using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.Machine.WebApi.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectService : ProjectService<SFProjectResource, SFProjectEntity>
    {
        private readonly IEngineService _engineService;

        public SFProjectService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SFProjectEntity> projects, IEngineService engineService)
            : base(jsonApiContext, mapper, userAccessor, projects)
        {
            _engineService = engineService;
        }

        public IResourceMapper<SyncJobResource, SyncJobEntity> SyncJobMapper { get; set; }
        public IResourceMapper<TextResource, TextEntity> TextMapper { get; set; }

        protected override IRelationship<SFProjectEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case nameof(SFProjectResource.ActiveSyncJob):
                    return Custom(SyncJobMapper, p =>
                        {
                            return j => j.ProjectRef == p.Id && SyncJobEntity.ActiveStates.Contains(j.State);
                        });
                case nameof(SFProjectResource.Texts):
                    return OneToMany(TextMapper, t => t.ProjectRef);
            }
            return base.GetRelationship(relationshipName);
        }

        protected override async Task<SFProjectEntity> InsertEntityAsync(SFProjectEntity entity)
        {
            entity = await base.InsertEntityAsync(entity);
            if (entity.TranslateConfig.Enabled)
            {
                await _engineService.AddProjectAsync(entity.Id, entity.TranslateConfig.SourceInputSystem.Tag,
                    entity.InputSystem.Tag, null, null, false);
            }
            return entity;
        }
    }
}
