using Hangfire;
using Hangfire.Server;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Services
{
    public class SendReceiveRunner
    {
        private readonly IRepository<SendReceiveJob> _jobRepo;

        public SendReceiveRunner(IRepository<SendReceiveJob> jobRepo)
        {
            _jobRepo = jobRepo;
        }

        public async Task RunAsync(PerformContext context, IJobCancellationToken cancellationToken, string id)
        {
            SendReceiveJob job = await _jobRepo.UpdateAsync(j => j.Id == id && j.BackgroundJobId == null,
                b => b.Set(j => j.BackgroundJobId, context.BackgroundJob.Id));
            if (job == null)
                return;

            // TODO: perform send/receive
            await Task.Delay(5000);

            await _jobRepo.DeleteAsync(job);
        }
    }
}
