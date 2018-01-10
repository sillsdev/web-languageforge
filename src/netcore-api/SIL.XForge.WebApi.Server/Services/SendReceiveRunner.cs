using Hangfire;
using Hangfire.Server;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Newtonsoft.Json.Linq;
using ShareDB;
using ShareDB.RichText;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Options;
using System;
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
        private readonly IRepository<TranslateProject> _projectRepo;
        private readonly ParatextService _paratextService;
        private readonly SendReceiveOptions _options;
        private readonly IProjectRepositoryFactory<TranslateDocumentSet> _docSetRepoFactory;

        public SendReceiveRunner(IOptions<SendReceiveOptions> options, IRepository<User> userRepo,
            IRepository<SendReceiveJob> jobRepo, IRepository<TranslateProject> projectRepo,
            ParatextService paratextService, IProjectRepositoryFactory<TranslateDocumentSet> docSetRepoFactory)
        {
            _options = options.Value;
            _userRepo = userRepo;
            _jobRepo = jobRepo;
            _projectRepo = projectRepo;
            _paratextService = paratextService;
            _docSetRepoFactory = docSetRepoFactory;
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
                if ((await _projectRepo.TryGetAsync(job.ProjectRef)).TryResult(out TranslateProject project))
                {
                    if (!Directory.Exists(_options.TranslateDir))
                        Directory.CreateDirectory(_options.TranslateDir);

                    IRepository<TranslateDocumentSet> docSetRepo = _docSetRepoFactory.Create(project);
                    using (var conn = new Connection(new Uri(_options.ShareDBUrl)))
                    {
                        await conn.ConnectAsync();

                        await SendReceiveAsync(user, conn, project, docSetRepo, project.Config.Source.ParatextProject,
                            "source");
                        await SendReceiveAsync(user, conn, project, docSetRepo, project.Config.Target.ParatextProject,
                            "target");

                        await conn.CloseAsync();
                    }
                }
            }

            await _jobRepo.UpdateAsync(j => j.Id == jobId,
                b => b.Set(j => j.State, SendReceiveJob.IdleState)
                      .Unset(j => j.BackgroundJobId));
        }

        private async Task SendReceiveAsync(User user, Connection conn, TranslateProject project,
            IRepository<TranslateDocumentSet> docSetRepo, ParatextProject paratextProject, string docType)
        {
            if (!(await _paratextService.TryGetBooksAsync(user, paratextProject.Id))
                .TryResult(out IReadOnlyList<string> bookIds))
            {
                return;
            }

            string projectPath = GetProjectPath(project, paratextProject);
            if (!Directory.Exists(projectPath))
                Directory.CreateDirectory(projectPath);

            foreach (string bookId in bookIds)
            {
                TranslateDocumentSet docSet = await docSetRepo.Query()
                    .FirstOrDefaultAsync(ds => ds.BookId == bookId && !ds.IsDeleted);
                if (docSet == null)
                {
                    // TODO: get book name from book id
                    docSet = new TranslateDocumentSet { Name = bookId, BookId = bookId };
                    await docSetRepo.InsertAsync(docSet);
                }
                Document<Delta> doc = GetShareDBDocument(conn, project, docSet, docType);
                string fileName = GetBookTextFileName(projectPath, bookId);
                if (File.Exists(fileName))
                    await SendReceiveBookAsync(user, paratextProject, fileName, bookId, doc);
                else
                    await CloneBookAsync(user, paratextProject, fileName, bookId, doc);
            }
        }

        private async Task SendReceiveBookAsync(User user, ParatextProject paratextProject, string fileName,
            string bookId, Document<Delta> doc)
        {
            await doc.FetchAsync();
            XElement bookTextElem = await LoadBookTextAsync(fileName);

            XElement usxElem = DeltaUsxMapper.UpdateUsx(doc.Data, bookTextElem.Element("usx"));

            var revision = (string) bookTextElem.Attribute("revision");

            if ((await _paratextService.TryUpdateBookTextAsync(user, paratextProject.Id, bookId, revision,
                usxElem.ToString())).TryResult(out string bookText))
            {
                bookTextElem = XElement.Parse(bookText);

                await SaveBookTextAsync(bookTextElem, fileName);

                Delta delta = DeltaUsxMapper.UpdateDelta(bookTextElem.Element("usx"), doc.Data);
                await doc.SubmitOpAsync(delta);
            }
        }

        private async Task CloneBookAsync(User user, ParatextProject paratextProject, string fileName,
            string bookId, Document<Delta> doc)
        {
            if (!(await _paratextService.TryGetBookTextAsync(user, paratextProject.Id, bookId))
                .TryResult(out string bookText))
            {
                return;
            }

            var bookTextElem = XElement.Parse(bookText);

            await SaveBookTextAsync(bookTextElem, fileName);

            Delta delta = DeltaUsxMapper.UpdateDelta(bookTextElem.Element("usx"), new Delta());
            await doc.CreateAsync(delta);
        }

        private async Task<XElement> LoadBookTextAsync(string fileName)
        {
            using (var stream = new FileStream(fileName, FileMode.Open))
            {
                return await XElement.LoadAsync(stream, LoadOptions.None, CancellationToken.None);
            }
        }

        private async Task SaveBookTextAsync(XElement bookTextElem, string fileName)
        {
            using (var stream = new FileStream(fileName, FileMode.Create))
            {
                await bookTextElem.SaveAsync(stream, SaveOptions.None, CancellationToken.None);
            }
        }

        private string GetProjectPath(TranslateProject project, ParatextProject paratextProject)
        {
            return Path.Combine(_options.TranslateDir, project.ProjectCode, paratextProject.Id);
        }

        private string GetBookTextFileName(string projectPath, string bookId)
        {
            return Path.Combine(projectPath, bookId + ".xml");
        }

        private Document<Delta> GetShareDBDocument(Connection conn, TranslateProject project,
            TranslateDocumentSet docSet, string docType)
        {
            return conn.Get<Delta>($"sf_{project.ProjectCode}", $"{docSet.Id}:{docType}");
        }
    }
}
