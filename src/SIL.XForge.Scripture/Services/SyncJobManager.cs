using System.Linq;
using System.Threading.Tasks;
using Hangfire;
using MongoDB.Bson;
using SIL.XForge.DataAccess;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class SyncJobManager
    {
        private readonly IRepository<SyncJobEntity> _jobs;
        private readonly IRepository<SFProjectEntity> _projects;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public SyncJobManager(IRepository<SyncJobEntity> jobs, IRepository<SFProjectEntity> projects,
            IBackgroundJobClient backgroundJobClient)
        {
            _jobs = jobs;
            _projects = projects;
            _backgroundJobClient = backgroundJobClient;
        }

        public async Task<SyncJobEntity> StartAsync(SyncJobEntity job)
        {
            if (job.Id == null)
                job.Id = ObjectId.GenerateNewId().ToString();

            job = await _jobs.UpdateAsync(
                j => j.ProjectRef == job.ProjectRef && SyncJobEntity.ActiveStates.Contains(j.State),
                u => u
                    .SetOnInsert(j => j.Id, job.Id)
                    .SetOnInsert(j => j.ProjectRef, job.ProjectRef)
                    .SetOnInsert(j => j.State, SyncJobEntity.PendingState)
                    .SetOnInsert(j => j.OwnerRef, job.OwnerRef)
                    .Inc(j => j.StartCount, 1),
                true);
            if (job.StartCount == 1)
            {
                await _projects.UpdateAsync(job.ProjectRef, u => u.Set(p => p.ActiveSyncJobRef, job.Id));
                // new job, so enqueue the runner
                string jobId = job.Id;
                _backgroundJobClient.Enqueue<ParatextSyncRunner>(r => r.RunAsync(null, null, job.OwnerRef, jobId));
                return job;
            }
            return null;
        }

        public async Task<bool> CancelAsync(string id)
        {
            SyncJobEntity job = await _jobs.DeleteAsync(
                j => j.Id == id && SyncJobEntity.ActiveStates.Contains(j.State));
            if (job != null)
            {
                _backgroundJobClient.Delete(job.BackgroundJobId);
                return true;
            }

            return false;
        }

        public async Task<bool> CancelByProjectIdAsync(string projectId)
        {
            SyncJobEntity job = await _jobs.DeleteAsync(
                j => j.ProjectRef == projectId && SyncJobEntity.ActiveStates.Contains(j.State));
            if (job != null)
            {
                _backgroundJobClient.Delete(job.BackgroundJobId);
                return true;
            }
            return false;
        }
    }
}
