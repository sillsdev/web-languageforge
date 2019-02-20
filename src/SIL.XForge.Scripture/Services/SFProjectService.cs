using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Options;
using SIL.Machine.WebApi.Services;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectService : ProjectService<SFProjectResource, SFProjectEntity>
    {
        private readonly IEngineService _engineService;
        private readonly IOptions<SiteOptions> _siteOptions;

        public SFProjectService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SFProjectEntity> projects, IEngineService engineService, IOptions<SiteOptions> siteOptions)
            : base(jsonApiContext, mapper, userAccessor, projects)
        {
            _engineService = engineService;
            _siteOptions = siteOptions;
        }

        public IProjectDataMapper<SyncJobResource, SyncJobEntity> SyncJobMapper { get; set; }
        public IProjectDataMapper<TextResource, TextEntity> TextMapper { get; set; }

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

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            bool result = await base.DeleteEntityAsync(id);
            if (result)
            {
                await SyncJobMapper.DeleteAllAsync(id);
                await TextMapper.DeleteAllAsync(id);
                await _engineService.RemoveProjectAsync(id);
                string syncDir = Path.Combine(_siteOptions.Value.SiteDir, "sync", id);
                if (Directory.Exists(syncDir))
                    Directory.Delete(syncDir, true);
            }
            return result;
        }
    }
}
