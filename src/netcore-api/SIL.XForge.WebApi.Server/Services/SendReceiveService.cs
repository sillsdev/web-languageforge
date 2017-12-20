using Hangfire;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Services
{
    public class SendReceiveService
    {
        public bool StartJob(SendReceiveJob job)
        {
            if (job.State != SendReceiveJob.PendingState)
                return false;

            string id = job.Id;
            BackgroundJob.Enqueue<SendReceiveRunner>(r => r.RunAsync(null, null, id));
            return true;
        }

        public void CancelJob(SendReceiveJob job)
        {
            if (job.State != SendReceiveJob.SyncingState)
                return;

            BackgroundJob.Delete(job.BackgroundJobId);
        }
    }
}
