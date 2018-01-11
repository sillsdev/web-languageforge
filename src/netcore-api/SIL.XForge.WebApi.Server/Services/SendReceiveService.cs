using System.Threading.Tasks;
using Hangfire;
using MongoDB.Driver;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Utils;

namespace SIL.XForge.WebApi.Server.Services
{
    public class SendReceiveService
    {
        private readonly IRepository<SendReceiveJob> _jobRepo;

        public SendReceiveService(IRepository<SendReceiveJob> jobRepo)
        {
            _jobRepo = jobRepo;
        }

        public async Task<Attempt<SendReceiveJob>> TryCreateJobAsync(string userId, string projectId)
        {
            SendReceiveJob job = await _jobRepo.UpdateAsync(j => j.ProjectRef == projectId
                && j.State != SendReceiveJob.IdleState,
                b => b
                    .SetOnInsert(j => j.ProjectRef, projectId)
                    .SetOnInsert(j => j.State, SendReceiveJob.PendingState)
                    .Inc(j => j.StartCount, 1),
                true);
            if (job.StartCount == 1)
            {
                // new job, so enqueue the runner
                string jobId = job.Id;
                BackgroundJob.Enqueue<SendReceiveRunner>(r => r.RunAsync(null, null, userId, jobId));
                return Attempt.Success(job);
            }
            return Attempt.Failure(job);
        }

        public async Task<bool> DeleteJobAsync(SendReceiveJob job)
        {
            if (await _jobRepo.DeleteAsync(job))
            {
                if (job.State != SendReceiveJob.IdleState)
                    BackgroundJob.Delete(job.BackgroundJobId);
                return true;
            }
            return false;
        }
    }
}
