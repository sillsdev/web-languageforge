using System;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Hangfire;
using SIL.Machine.WebApi.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Scripture.Services;
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
        public IResourceMapper<QuestionResource, QuestionEntity> QuestionMapper { get; set; }

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
                case nameof(SFProjectResource.Questions):
                    return OneToMany(QuestionMapper, q => q.ProjectRef);
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

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            var resource = await GetAsync(id);
            string jobId = resource.ActiveSyncJob.Id;
            BackgroundJob.Enqueue<ParatextSyncRunner>(r => r.DeleteProject(null, null, jobId));
            return jobId != null;
    }
}
