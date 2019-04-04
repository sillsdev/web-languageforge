using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Options;
using SIL.Machine.WebApi.Models;
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
        private readonly SyncJobManager _syncJobManager;

        public SFProjectService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SFProjectEntity> projects, IEngineService engineService, IOptions<SiteOptions> siteOptions,
            SyncJobManager syncJobManager)
            : base(jsonApiContext, mapper, userAccessor, projects)
        {
            _engineService = engineService;
            _siteOptions = siteOptions;
            _syncJobManager = syncJobManager;
        }

        public IProjectDataMapper<SyncJobResource, SyncJobEntity> SyncJobMapper { get; set; }
        public IProjectDataMapper<TextResource, TextEntity> TextMapper { get; set; }

        protected override IRelationship<SFProjectEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case nameof(SFProjectResource.ActiveSyncJob):
                    return HasOne(SyncJobMapper, p => p.ActiveSyncJobRef);
                case nameof(SFProjectResource.Texts):
                    return HasMany(TextMapper, t => t.ProjectRef);
            }
            return base.GetRelationship(relationshipName);
        }

        protected override async Task<SFProjectEntity> InsertEntityAsync(SFProjectEntity entity)
        {
            entity = await base.InsertEntityAsync(entity);
            if (entity.TranslateConfig.Enabled)
            {
                var project = new Project
                {
                    Id = entity.Id,
                    SourceLanguageTag = entity.TranslateConfig.SourceInputSystem.Tag,
                    TargetLanguageTag = entity.InputSystem.Tag
                };
                await _engineService.AddProjectAsync(project);
            }

            var job = new SyncJobEntity()
            {
                Id = entity.ActiveSyncJobRef,
                ProjectRef = entity.Id,
                OwnerRef = UserId
            };
            await _syncJobManager.StartAsync(job);

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

        protected override async Task<SFProjectEntity> UpdateEntityAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            SFProjectEntity entity = await base.UpdateEntityAsync(id, attrs, relationships);
            if (entity.TranslateConfig.Enabled && attrs.TryGetValue("TranslateConfig", out object translateConfig) &&
                ((TranslateConfig)translateConfig).SourceParatextId != null)
            {
                // if currently running sync job for project is found, cancel it
                await _syncJobManager.CancelByProjectIdAsync(id);

                await _engineService.RemoveProjectAsync(entity.Id);
                var project = new Project
                {
                    Id = entity.Id,
                    SourceLanguageTag = entity.TranslateConfig.SourceInputSystem.Tag,
                    TargetLanguageTag = entity.InputSystem.Tag
                };
                await _engineService.AddProjectAsync(project);

                var job = new SyncJobEntity()
                {
                    ProjectRef = id,
                    OwnerRef = UserId
                };
                await _syncJobManager.StartAsync(job);
            }
            return entity;
        }
    }
}
