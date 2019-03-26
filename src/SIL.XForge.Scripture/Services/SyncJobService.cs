using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Hangfire;
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
        private readonly IBackgroundJobClient _backgroundJobClient;
        public SyncJobService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SyncJobEntity> jobs, IRepository<SFProjectEntity> projects,
            IBackgroundJobClient backgroundJobClient)
            : base(jsonApiContext, mapper, userAccessor, jobs, projects)
        {
            _backgroundJobClient = backgroundJobClient;
        }

        protected override int Domain => SFDomain.SyncJobs;

        protected override async Task<SyncJobEntity> InsertEntityAsync(SyncJobEntity entity)
        {
            SyncJobEntity job = await Entities.UpdateAsync(
                j => j.ProjectRef == entity.ProjectRef && SyncJobEntity.ActiveStates.Contains(j.State),
                u => u
                    .SetOnInsert(j => j.Id, entity.Id)
                    .SetOnInsert(j => j.ProjectRef, entity.ProjectRef)
                    .SetOnInsert(j => j.State, SyncJobEntity.PendingState)
                    .Inc(j => j.StartCount, 1),
                true);
            if (job.StartCount == 1)
            {
                // new job, so enqueue the runner
                string jobId = job.Id;
                _backgroundJobClient.Enqueue<ParatextSyncRunner>(r => r.RunAsync(null, null, UserId, jobId));
                return job;
            }

            throw new JsonApiException(StatusCodes.Status409Conflict,
                "There is already an active send/receive job for this project.");
        }

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            SyncJobEntity job = await Entities.DeleteAsync(id);
            if (job != null)
            {
                if (SyncJobEntity.ActiveStates.Contains(job.State))
                    _backgroundJobClient.Delete(job.BackgroundJobId);
                return true;
            }

            return false;
        }
    }
}
