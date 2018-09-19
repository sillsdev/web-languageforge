using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Hangfire;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SendReceiveJobService : SFProjectDataServiceBase<SendReceiveJobResource, SendReceiveJobEntity>
    {
        public SendReceiveJobService(IJsonApiContext jsonApiContext, IRepository<SFProjectEntity> projects,
            IRepository<SendReceiveJobEntity> entities, IMapper mapper, IUserAccessor userAccessor)
            : base(jsonApiContext, projects, entities, mapper, userAccessor)
        {
        }

        protected override Domain Domain => Domain.SendReceiveJobs;

        protected override async Task<SendReceiveJobEntity> InsertEntityAsync(SendReceiveJobEntity entity)
        {
            SendReceiveJobEntity job = await Entities.UpdateAsync(
                j => j.ProjectRef == entity.ProjectRef && SendReceiveJobEntity.ActiveStates.Contains(j.State),
                u => u
                    .SetOnInsert(j => j.Id, entity.Id)
                    .SetOnInsert(j => j.ProjectRef, entity.ProjectRef)
                    .SetOnInsert(j => j.State, SendReceiveJobEntity.PendingState)
                    .Inc(j => j.StartCount, 1),
                true);
            if (job.StartCount == 1)
            {
                // new job, so enqueue the runner
                string jobId = job.Id;
                BackgroundJob.Enqueue<ParatextSendReceiveRunner>(r => r.RunAsync(null, null, UserId, jobId));
                return job;
            }

            throw new JsonApiException(StatusCodes.Status409Conflict,
                "There is already an active send/receive job for this project.");
        }

        protected override async Task<bool> DeleteEntityAsync(string id)
        {
            SendReceiveJobEntity job = await Entities.DeleteAsync(id);
            if (job != null)
            {
                if (SendReceiveJobEntity.ActiveStates.Contains(job.State))
                    BackgroundJob.Delete(job.BackgroundJobId);
                return true;
            }

            return false;
        }
    }
}
