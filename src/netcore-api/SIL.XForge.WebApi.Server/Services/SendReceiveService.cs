using Hangfire;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Services
{
    public class SendReceiveService
    {
        public void StartJob(SendReceiveJob job)
        {
            if (job.BackgroundJobId != null)
                return;

            string id = job.Id;
            BackgroundJob.Enqueue<SendReceiveRunner>(r => r.RunAsync(null, null, id));
        }

        public void CancelJob(SendReceiveJob job)
        {
            if (job.BackgroundJobId == null)
                return;

            BackgroundJob.Delete(job.BackgroundJobId);
        }
    }
}
