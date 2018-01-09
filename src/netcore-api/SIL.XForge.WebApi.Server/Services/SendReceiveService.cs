using System.Threading.Tasks;
using Hangfire;
using Nito.AsyncEx;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Utils;

namespace SIL.XForge.WebApi.Server.Services
{
    public class SendReceiveService
    {
        private readonly IRepository<SendReceiveJob> _jobRepo;
        private readonly AsyncLock _lock;

        public SendReceiveService(IRepository<SendReceiveJob> jobRepo)
        {
            _jobRepo = jobRepo;
            _lock = new AsyncLock();
        }

        public async Task<Attempt<SendReceiveJob>> TryCreateJobAsync(string userId, string projectId)
        {
            // lock so that we don't start multiple send/receive jobs on the same project
            using (await _lock.LockAsync())
            {
                SendReceiveJob job = await _jobRepo.UpdateAsync(j => j.ProjectRef == projectId
                    && j.State != SendReceiveJob.IdleState,
                    b => b.SetOnInsert(j => j.ProjectRef, projectId), true);
                if (job.State == null)
                {
                    // new job, so enqueue the runner
                    string jobId = job.Id;
                    await _jobRepo.UpdateAsync(j => j.Id == jobId,
                        b => b.Set(j => j.State, SendReceiveJob.PendingState));
                    BackgroundJob.Enqueue<SendReceiveRunner>(r => r.RunAsync(null, null, userId, jobId));
                    return Attempt.Success(job);
                }
                return Attempt.Failure(job);
            }
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
