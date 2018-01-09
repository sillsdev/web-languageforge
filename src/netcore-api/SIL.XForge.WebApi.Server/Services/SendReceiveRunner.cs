using Hangfire;
using Hangfire.Server;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Options;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace SIL.XForge.WebApi.Server.Services
{
    public class SendReceiveRunner
    {
        private readonly IRepository<User> _userRepo;
        private readonly IRepository<SendReceiveJob> _jobRepo;
        private readonly IRepository<TranslateProject> _translateProjectRepo;
        private readonly ParatextService _paratextService;
        private readonly SendReceiveOptions _options;

        public SendReceiveRunner(IOptions<SendReceiveOptions> options, IRepository<User> userRepo,
            IRepository<SendReceiveJob> jobRepo, IRepository<TranslateProject> translateProjectRepo,
            ParatextService paratextService)
        {
            _options = options.Value;
            _userRepo = userRepo;
            _jobRepo = jobRepo;
            _translateProjectRepo = translateProjectRepo;
            _paratextService = paratextService;
        }

        public async Task RunAsync(PerformContext context, IJobCancellationToken cancellationToken, string userId,
            string jobId)
        {
            SendReceiveJob job = await _jobRepo.UpdateAsync(j => j.Id == jobId,
                b => b.Set(j => j.BackgroundJobId, context.BackgroundJob.Id)
                      .Set(j => j.State, SendReceiveJob.SyncingState));
            if (job == null)
                return;

            if ((await _userRepo.TryGetAsync(userId)).TryResult(out User user))
            {
                if ((await _translateProjectRepo.TryGetAsync(job.ProjectRef)).TryResult(out TranslateProject project))
                {
                    if (!Directory.Exists(_options.TranslateDir))
                        Directory.CreateDirectory(_options.TranslateDir);

                    await SendReceiveAsync(user, project, project.Config.Source.ParatextProject);
                    await SendReceiveAsync(user, project, project.Config.Target.ParatextProject);
                }
            }

            await _jobRepo.UpdateAsync(j => j.Id == jobId,
                b => b.Set(j => j.State, SendReceiveJob.IdleState)
                      .Unset(j => j.BackgroundJobId));
        }

        private async Task SendReceiveAsync(User user, TranslateProject translateProject,
            ParatextProject paratextProject)
        {
            if (!(await _paratextService.TryGetBooksAsync(user, paratextProject.Id))
                .TryResult(out IReadOnlyList<string> bookIds))
            {
                return;
            }

            string projectPath = GetProjectPath(translateProject, paratextProject);
            if (!Directory.Exists(projectPath))
                Directory.CreateDirectory(projectPath);

            foreach (string bookId in bookIds)
            {
                string fileName = Path.Combine(projectPath, bookId + ".xml");
                if (File.Exists(fileName))
                    await SendReceiveBookAsync(user, paratextProject, bookId, fileName);
                else
                    await CloneBookAsync(user, paratextProject, projectPath, bookId);
            }
        }

        private async Task SendReceiveBookAsync(User user, ParatextProject paratextProject, string bookId,
            string fileName)
        {
            (string revision, string text) = await UpdateBookFileAsync(fileName);

            if ((await _paratextService.TryUpdateBookTextAsync(user, paratextProject.Id, bookId, revision,
                text)).TryResult(out string bookText))
            {
                var bookTextElem = XElement.Parse(bookText);
                await UpdateShareDBDocAsync(bookTextElem);
            }
        }

        private async Task CloneBookAsync(User user, ParatextProject paratextProject, string projectPath,
            string bookId)
        {
            if (!(await _paratextService.TryGetBookTextAsync(user, paratextProject.Id, bookId))
                .TryResult(out string bookText))
            {
                return;
            }

            var bookTextElem = XElement.Parse(bookText);
            using (var stream = new FileStream(Path.Combine(projectPath, bookId + ".xml"), FileMode.Create))
            {
                await bookTextElem.SaveAsync(stream, SaveOptions.None, CancellationToken.None);
            }
            await UpdateShareDBDocAsync(bookTextElem);
        }

        private async Task<(string Revision, string Text)> UpdateBookFileAsync(string fileName)
        {
            XElement bookTextElem;
            using (var stream = new FileStream(fileName, FileMode.Open))
            {
                bookTextElem = await XElement.LoadAsync(stream, LoadOptions.None, CancellationToken.None);
            }

            // TODO: update book text from ShareDB document

            var revision = (string) bookTextElem.Attribute("revision");
            XElement usxElem = bookTextElem.Element("usx");
            return (revision, usxElem.ToString());
        }

        private Task UpdateShareDBDocAsync(XElement bookTextElem)
        {
            // TODO: update ShareDB document from book text
            return Task.CompletedTask;
        }

        private string GetProjectPath(TranslateProject translateProject, ParatextProject paratextProject)
        {
            return Path.Combine(_options.TranslateDir, translateProject.ProjectCode, paratextProject.Id);
        }
    }
}
