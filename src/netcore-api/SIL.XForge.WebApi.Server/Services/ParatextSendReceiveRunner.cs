using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using Hangfire;
using Hangfire.Server;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using ShareDB;
using ShareDB.RichText;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Models.Translate;
using SIL.XForge.WebApi.Server.Options;

namespace SIL.XForge.WebApi.Server.Services
{
    public class ParatextSendReceiveRunner
    {
        private static readonly Dictionary<string, string> BookNames = new Dictionary<string, string>
        {
            { "GEN", "Genesis" },
            { "EXO", "Exodus" },
            { "LEV", "Leviticus" },
            { "NUM", "Numbers" },
            { "DEU", "Deuteronomy" },
            { "JOS", "Joshua" },
            { "JDG", "Judges" },
            { "RUT", "Ruth" },
            { "1SA", "1 Samuel" },
            { "2SA", "2 Samuel" },
            { "1KI", "1 Kings" },
            { "2KI", "2 Kings" },
            { "1CH", "1 Chronicles" },
            { "2CH", "2 Chronicles" },
            { "EZR", "Ezra" },
            { "NEH", "Nehemiah" },
            { "EST", "Esther" },
            { "JOB", "Job" },
            { "PSA", "Psalm" },
            { "PRO", "Proverbs" },
            { "ECC", "Ecclesiastes" },
            { "SNG", "Song of Songs" },
            { "ISA", "Isaiah" },
            { "JER", "Jeremiah" },
            { "LAM", "Lamentations" },
            { "EZK", "Ezekiel" },
            { "DAN", "Daniel" },
            { "HOS", "Hosea" },
            { "JOL", "Joel" },
            { "AMO", "Amos" },
            { "OBA", "Obadiah" },
            { "JON", "Jonah" },
            { "MIC", "Micah" },
            { "NAM", "Nahum" },
            { "HAB", "Habakkuk" },
            { "ZEP", "Zephaniah" },
            { "HAG", "Haggai" },
            { "ZEC", "Zechariah" },
            { "MAL", "Malachi" },
            { "MAT", "Matthew" },
            { "MRK", "Mark" },
            { "LUK", "Luke" },
            { "JHN", "John" },
            { "ACT", "Acts" },
            { "ROM", "Romans" },
            { "1CO", "1 Corinthians" },
            { "2CO", "2 Corinthians" },
            { "GAL", "Galatians" },
            { "EPH", "Ephesians" },
            { "PHP", "Philippians" },
            { "COL", "Colossians" },
            { "1TH", "1 Thessalonians" },
            { "2TH", "2 Thessalonians" },
            { "1TI", "1 Timothy" },
            { "2TI", "2 Timothy" },
            { "TIT", "Titus" },
            { "PHM", "Philemon" },
            { "HEB", "Hebrews" },
            { "JAS", "James" },
            { "1PE", "1 Peter" },
            { "2PE", "2 Peter" },
            { "1JN", "1 John" },
            { "2JN", "2 John" },
            { "3JN", "3 John" },
            { "JUD", "Jude" },
            { "REV", "Revelation" },
            { "TOB", "Tobit" },
            { "JDT", "Judith" },
            { "ESG", "Esther (Greek)" },
            { "WIS", "The Wisdom of Solomon" },
            { "SIR", "Sirach" },
            { "BAR", "Baruch" },
            { "LJE", "Letter of Jeremiah" },
            { "S3Y", "Song of Three Young Men" },
            { "SUS", "Susanna" },
            { "BEL", "Bel and the Dragon" },
            { "1MA", "1 Maccabees" },
            { "2MA", "2 Maccabees" },
            { "1ES", "1 Esdras" },
            { "2ES", "2 Esdras" },
            { "MAN", "The Prayer of Manasseh" }
        };

        private readonly IRepository<User> _userRepo;
        private readonly IRepository<SendReceiveJob> _jobRepo;
        private readonly IRepository<TranslateProject> _projectRepo;
        private readonly ParatextService _paratextService;
        private readonly IOptions<SendReceiveOptions> _options;
        private readonly IProjectRepositoryFactory<TranslateDocumentSet> _docSetRepoFactory;
        private readonly DeltaUsxMapper _deltaUsxMapper;
        private readonly ILogger<ParatextSendReceiveRunner> _logger;

        public ParatextSendReceiveRunner(IOptions<SendReceiveOptions> options, IRepository<User> userRepo,
            IRepository<SendReceiveJob> jobRepo, IRepository<TranslateProject> projectRepo,
            ParatextService paratextService, IProjectRepositoryFactory<TranslateDocumentSet> docSetRepoFactory,
            DeltaUsxMapper deltaUsxMapper, ILogger<ParatextSendReceiveRunner> logger)
        {
            _options = options;
            _userRepo = userRepo;
            _jobRepo = jobRepo;
            _projectRepo = projectRepo;
            _paratextService = paratextService;
            _docSetRepoFactory = docSetRepoFactory;
            _deltaUsxMapper = deltaUsxMapper;
            _logger = logger;
        }

        public async Task RunAsync(PerformContext context, IJobCancellationToken cancellationToken, string userId,
            string jobId)
        {
            SendReceiveJob job = await _jobRepo.UpdateAsync(j => j.Id == jobId, u => u
                .Set(j => j.BackgroundJobId, context.BackgroundJob.Id)
                .Set(j => j.State, SendReceiveJob.SyncingState));
            if (job == null)
                return;

            try
            {
                SendReceiveOptions options = _options.Value;
                if ((await _userRepo.TryGetAsync(userId)).TryResult(out User user))
                {
                    if ((await _projectRepo.TryGetAsync(job.ProjectRef)).TryResult(out TranslateProject project))
                    {
                        if (!Directory.Exists(options.TranslateDir))
                            Directory.CreateDirectory(options.TranslateDir);

                        IRepository<TranslateDocumentSet> docSetRepo = _docSetRepoFactory.Create(project);
                        using (var conn = new Connection(new Uri(options.ShareDBUrl)))
                        {
                            await conn.ConnectAsync();

                            ParatextProject sourceParatextProject = project.Config.Source.ParatextProject;
                            IReadOnlyList<string> sourceBooks = await _paratextService.GetBooksAsync(user,
                                sourceParatextProject.Id);

                            ParatextProject targetParatextProject = project.Config.Target.ParatextProject;
                            IReadOnlyList<string> targetBooks = await _paratextService.GetBooksAsync(user,
                                targetParatextProject.Id);

                            var booksToSendReceive = new HashSet<string>();
                            booksToSendReceive.UnionWith(sourceBooks);
                            booksToSendReceive.IntersectWith(targetBooks);

                            var booksToDelete = new HashSet<string>();
                            booksToDelete.UnionWith(GetBooksToDelete(project, sourceParatextProject, sourceBooks));
                            booksToDelete.UnionWith(GetBooksToDelete(project, targetParatextProject, targetBooks));

                            int step = 0;
                            int stepCount = booksToSendReceive.Count + booksToDelete.Count;
                            foreach (string bookId in booksToSendReceive)
                            {
                                if (!BookNames.TryGetValue(bookId, out string name))
                                    name = bookId;
                                TranslateDocumentSet docSet = await docSetRepo.UpdateAsync(ds => ds.BookId == bookId,
                                    u => u.SetOnInsert(ds => ds.Name, name)
                                          .SetOnInsert(ds => ds.BookId, bookId)
                                          .Set(ds => ds.IsDeleted, false), true);

                                await SendReceiveBookAsync(user, conn, project, docSet, sourceParatextProject, "source",
                                    bookId);
                                await SendReceiveBookAsync(user, conn, project, docSet, targetParatextProject, "target",
                                    bookId);
                                step++;
                                job = await UpdateProgress(job, step, stepCount);
                            }

                            foreach (string bookId in booksToDelete)
                            {
                                TranslateDocumentSet docSet = await docSetRepo.UpdateAsync(ds => ds.BookId == bookId,
                                    u => u.Set(ds => ds.IsDeleted, true));

                                await DeleteBookAsync(conn, project, docSet, sourceParatextProject, "source", bookId);
                                await DeleteBookAsync(conn, project, docSet, targetParatextProject, "target", bookId);
                                step++;
                                job = await UpdateProgress(job, step, stepCount);
                            }

                            await conn.CloseAsync();
                        }

                        job = await _jobRepo.UpdateAsync(job, u => u
                            .Set(j => j.State, SendReceiveJob.IdleState)
                            .Unset(j => j.BackgroundJobId));
                        await _projectRepo.UpdateAsync(project,
                            u => u.Set(p => p.LastSyncedDate, job.DateModified));
                    }
                }
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while executing Paratext S/R job '{Job}'", job.Id);
                await _jobRepo.UpdateAsync(job, u => u
                    .Set(j => j.State, SendReceiveJob.HoldState)
                    .Unset(j => j.BackgroundJobId));
            }
        }

        private async Task<SendReceiveJob> UpdateProgress(SendReceiveJob job, int step, int stepCount)
        {
            double percentCompleted = (double) step / stepCount;
            return await _jobRepo.UpdateAsync(job, u => u
                .Set(j => j.PercentCompleted, percentCompleted));
        }

        private IEnumerable<string> GetBooksToDelete(TranslateProject project, ParatextProject paratextProject,
            IEnumerable<string> books)
        {
            string projectPath = GetProjectPath(project, paratextProject);
            var booksToDelete = new HashSet<string>(Directory.Exists(projectPath)
                ? Directory.EnumerateFiles(projectPath).Select(Path.GetFileNameWithoutExtension)
                : Enumerable.Empty<string>());
            booksToDelete.ExceptWith(books);
            return booksToDelete;
        }

        private async Task DeleteBookAsync(Connection conn, TranslateProject project, TranslateDocumentSet docSet,
            ParatextProject paratextProject, string docType, string bookId)
        {
            string projectPath = GetProjectPath(project, paratextProject);
            File.Delete(GetBookTextFileName(projectPath, bookId));
            Document<Delta> doc = GetShareDBDocument(conn, project, docSet, docType);
            await doc.FetchAsync();
            await doc.DeleteAsync();
        }

        private async Task SendReceiveBookAsync(User user, Connection conn, TranslateProject project,
            TranslateDocumentSet docSet, ParatextProject paratextProject, string docType, string bookId)
        {
            string projectPath = GetProjectPath(project, paratextProject);
            if (!Directory.Exists(projectPath))
                Directory.CreateDirectory(projectPath);

            Document<Delta> doc = GetShareDBDocument(conn, project, docSet, docType);
            string fileName = GetBookTextFileName(projectPath, bookId);
            if (File.Exists(fileName))
                await SyncBookAsync(user, paratextProject, fileName, bookId, doc);
            else
                await CloneBookAsync(user, paratextProject, fileName, bookId, doc);
        }

        private async Task SyncBookAsync(User user, ParatextProject paratextProject, string fileName,
            string bookId, Document<Delta> doc)
        {
            await doc.FetchAsync();
            XElement bookTextElem = await LoadBookTextAsync(fileName);

            XElement oldUsxElem = bookTextElem.Element("usx");
            if (oldUsxElem == null)
                throw new InvalidOperationException("Invalid USX data, missing 'usx' element.");
            XElement bookElem = oldUsxElem.Element("book");
            if (bookElem == null)
                throw new InvalidOperationException("Invalid USX data, missing 'book' element.");
            XElement newUsxElem = _deltaUsxMapper.ToUsx((string) oldUsxElem.Attribute("version"),
                (string) bookElem.Attribute("code"), (string) bookElem, doc.Data);

            var revision = (string) bookTextElem.Attribute("revision");

            string bookText;
            if (XNode.DeepEquals(oldUsxElem, newUsxElem))
            {
                bookText = await _paratextService.GetBookTextAsync(user, paratextProject.Id, bookId);
            }
            else
            {
                bookText = await _paratextService.UpdateBookTextAsync(user, paratextProject.Id, bookId, revision,
                    newUsxElem.ToString());
            }

            bookTextElem = XElement.Parse(bookText);

            Delta delta = _deltaUsxMapper.ToDelta(paratextProject.Id, bookTextElem.Element("usx"));
            Delta diffDelta = doc.Data.Diff(delta);
            await doc.SubmitOpAsync(diffDelta);

            await SaveBookTextAsync(bookTextElem, fileName);
        }

        private async Task CloneBookAsync(User user, ParatextProject paratextProject, string fileName,
            string bookId, Document<Delta> doc)
        {
            string bookText = await _paratextService.GetBookTextAsync(user, paratextProject.Id, bookId);

            var bookTextElem = XElement.Parse(bookText);

            Delta delta = _deltaUsxMapper.ToDelta(paratextProject.Id, bookTextElem.Element("usx"));
            await doc.CreateAsync(delta);

            await SaveBookTextAsync(bookTextElem, fileName);
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
            return Path.Combine(_options.Value.TranslateDir, project.Id, paratextProject.Id);
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
