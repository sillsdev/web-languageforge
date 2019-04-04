using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SyncJobService : SFProjectDataService<SyncJobResource, SyncJobEntity>
    {
        private readonly SyncJobManager _syncJobManager;
        public SyncJobService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SyncJobEntity> jobs, IRepository<SFProjectEntity> projects, SyncJobManager syncJobManager)
            : base(jsonApiContext, mapper, userAccessor, jobs, projects)
        {
            _syncJobManager = syncJobManager;
        }

        protected override int Domain => SFDomain.SyncJobs;

        protected override async Task<SyncJobEntity> InsertEntityAsync(SyncJobEntity entity)
        {
            SyncJobEntity job = await _syncJobManager.StartAsync(entity);
            if (job != null)
                return job;

            throw new JsonApiException(StatusCodes.Status409Conflict,
                "There is already an active send/receive job for this project.");
        }

        protected override Task<bool> DeleteEntityAsync(string id)
        {
            return _syncJobManager.CancelAsync(id);
        }
    }
}
