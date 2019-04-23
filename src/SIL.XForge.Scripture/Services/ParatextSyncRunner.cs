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
using Newtonsoft.Json.Linq;
using ShareDB;
using ShareDB.RichText;
using SIL.Machine.WebApi.Services;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.DataAccess;
using SIL.XForge.Scripture.Models;

namespace SIL.XForge.Scripture.Services
{
    public class ParatextSyncRunner
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

        private readonly IOptions<SiteOptions> _siteOptions;
        private readonly IOptions<RealtimeOptions> _realtimeOptions;
        private readonly IRepository<UserEntity> _users;
        private readonly IRepository<SyncJobEntity> _jobs;
        private readonly IRepository<SFProjectEntity> _projects;
        private readonly IRepository<TextEntity> _texts;
        private readonly IEngineService _engineService;
        private readonly IParatextService _paratextService;
        private readonly DeltaUsxMapper _deltaUsxMapper;
        private readonly ILogger<ParatextSyncRunner> _logger;

        private SyncJobEntity _job;
        private int _stepCount;
        private int _step;

        public ParatextSyncRunner(IOptions<SiteOptions> siteOptions,
            IOptions<RealtimeOptions> realtimeOptions, IRepository<UserEntity> users,
            IRepository<SyncJobEntity> jobs, IRepository<SFProjectEntity> projects,
            IRepository<TextEntity> texts,
            IEngineService engineService, IParatextService paratextService,
            DeltaUsxMapper deltaUsxMapper, ILogger<ParatextSyncRunner> logger)
        {
            _siteOptions = siteOptions;
            _realtimeOptions = realtimeOptions;
            _users = users;
            _jobs = jobs;
            _projects = projects;
            _texts = texts;
            _engineService = engineService;
            _paratextService = paratextService;
            _deltaUsxMapper = deltaUsxMapper;
            _logger = logger;
        }

        private string WorkingDir => Path.Combine(_siteOptions.Value.SiteDir, "sync");

        public async Task RunAsync(PerformContext context, IJobCancellationToken cancellationToken, string userId,
            string jobId)
        {
            _job = await _jobs.UpdateAsync(j => j.Id == jobId, u => u
                .Set(j => j.BackgroundJobId, context.BackgroundJob.Id)
                .Set(j => j.State, SyncJobEntity.SyncingState));
            if (_job == null)
                return;

            try
            {
                if ((await _users.TryGetAsync(userId)).TryResult(out UserEntity user)
                    && (await _projects.TryGetAsync(_job.ProjectRef)).TryResult(out SFProjectEntity project))
                {
                    if (!Directory.Exists(WorkingDir))
                        Directory.CreateDirectory(WorkingDir);

                    bool translateEnabled = project.TranslateConfig.Enabled;
                    using (var conn = new Connection(new Uri($"ws://localhost:{_realtimeOptions.Value.Port}")))
                    {
                        await conn.ConnectAsync();

                        string targetParatextId = project.ParatextId;
                        IReadOnlyList<string> targetBooks = await _paratextService.GetBooksAsync(user,
                            targetParatextId);

                        string sourceParatextId = project.TranslateConfig.SourceParatextId;
                        IReadOnlyList<string> sourceBooks = null;
                        if (translateEnabled)
                            sourceBooks = await _paratextService.GetBooksAsync(user, sourceParatextId);

                        var booksToSync = new HashSet<string>(targetBooks);
                        if (translateEnabled)
                            booksToSync.IntersectWith(sourceBooks);

                        var booksToDelete = new HashSet<string>(
                            GetBooksToDelete(project, targetParatextId, targetBooks));
                        if (translateEnabled)
                            booksToDelete.UnionWith(GetBooksToDelete(project, sourceParatextId, sourceBooks));

                        _step = 0;
                        _stepCount = booksToSync.Count * 3;
                        if (translateEnabled)
                            _stepCount *= 2;
                        _stepCount += booksToDelete.Count;
                        foreach (string bookId in booksToSync)
                        {
                            if (!BookNames.TryGetValue(bookId, out string name))
                                name = bookId;
                            TextEntity text = await _texts.UpdateAsync(
                                t => t.ProjectRef == project.Id && t.BookId == bookId,
                                u => u
                                    .SetOnInsert(t => t.Name, name)
                                    .SetOnInsert(t => t.BookId, bookId)
                                    .SetOnInsert(t => t.ProjectRef, project.Id)
                                    .SetOnInsert(t => t.OwnerRef, userId), upsert: true);

                            List<Chapter> newChapters = await SyncOrCloneBookUsxAsync(user, conn, project, text,
                                TextType.Target, targetParatextId, false);
                            if (translateEnabled)
                            {
                                var chaptersToInclude = new HashSet<int>(newChapters.Select(c => c.Number));
                                await SyncOrCloneBookUsxAsync(user, conn, project, text, TextType.Source,
                                    sourceParatextId, true, chaptersToInclude);
                            }
                            await UpdateNotesData(conn, text, newChapters);
                        }

                        foreach (string bookId in booksToDelete)
                        {

                            TextEntity text = await _texts.DeleteAsync(
                                t => t.ProjectRef == project.Id && t.BookId == bookId);

                            await DeleteBookUsxAsync(conn, project, text, TextType.Target, targetParatextId);
                            if (translateEnabled)
                                await DeleteBookUsxAsync(conn, project, text, TextType.Source, sourceParatextId);
                            await DeleteNotesData(conn, text);
                            await UpdateProgress();
                        }

                        await conn.CloseAsync();
                    }

                    // TODO: Properly handle job cancellation
                    cancellationToken.ThrowIfCancellationRequested();

                    if (translateEnabled)
                    {
                        // start training Machine engine
                        await _engineService.StartBuildByProjectIdAsync(_job.ProjectRef);
                    }

                    await _projects.UpdateAsync(_job.ProjectRef, u => u
                        .Set(p => p.LastSyncedDate, DateTime.UtcNow)
                        .Unset(p => p.ActiveSyncJobRef));
                }
                else
                {
                    await _projects.UpdateAsync(_job.ProjectRef, u => u.Unset(p => p.ActiveSyncJobRef));
                }
                _job = await _jobs.UpdateAsync(_job, u => u
                    .Set(j => j.State, SyncJobEntity.IdleState)
                    .Unset(j => j.BackgroundJobId));
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("The Paratext sync job '{Job}' was cancelled.", _job.Id);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while executing Paratext sync job '{Job}'", _job.Id);
                await _projects.UpdateAsync(_job.ProjectRef, u => u.Unset(p => p.ActiveSyncJobRef));
                await _jobs.UpdateAsync(_job, u => u
                    .Set(j => j.State, SyncJobEntity.HoldState)
                    .Unset(j => j.BackgroundJobId));
            }
        }

        private async Task<List<Chapter>> SyncOrCloneBookUsxAsync(UserEntity user, Connection conn,
            SFProjectEntity project, TextEntity text, TextType textType, string paratextId, bool isReadOnly,
            ISet<int> chaptersToInclude = null)
        {
            string projectPath = GetProjectPath(project, paratextId);
            if (!Directory.Exists(projectPath))
                Directory.CreateDirectory(projectPath);

            string fileName = GetUsxFileName(projectPath, text.BookId);
            if (File.Exists(fileName))
            {
                return await SyncBookUsxAsync(user, conn, text, textType, paratextId, fileName, isReadOnly,
                    chaptersToInclude);
            }
            else
            {
                return await CloneBookUsxAsync(user, conn, text, textType, paratextId, fileName, chaptersToInclude);
            }
        }

        private async Task<List<Chapter>> SyncBookUsxAsync(UserEntity user, Connection conn, TextEntity text,
            TextType textType, string paratextId, string fileName, bool isReadOnly, ISet<int> chaptersToInclude)
        {
            var textDataDocs = new SortedList<int, Document<Delta>>();
            var tasks = new List<Task>();
            foreach (Chapter chapter in text.Chapters)
            {
                Document<Delta> textDataDoc = GetTextDataDocument(conn, text, chapter.Number, textType);
                textDataDocs[chapter.Number] = textDataDoc;
                tasks.Add(textDataDoc.FetchAsync());
            }
            await Task.WhenAll(tasks);

            XElement bookTextElem;
            string bookText;
            if (isReadOnly)
            {
                bookText = await _paratextService.GetBookTextAsync(user, paratextId, text.BookId);
            }
            else
            {
                bookTextElem = await LoadUsxFileAsync(fileName);

                XElement oldUsxElem = bookTextElem.Element("usx");
                if (oldUsxElem == null)
                    throw new InvalidOperationException("Invalid USX data, missing 'usx' element.");
                XElement bookElem = oldUsxElem.Element("book");
                if (bookElem == null)
                    throw new InvalidOperationException("Invalid USX data, missing 'book' element.");
                XElement newUsxElem = _deltaUsxMapper.ToUsx((string)oldUsxElem.Attribute("version"),
                    (string)bookElem.Attribute("code"), (string)bookElem, textDataDocs.Values.Select(d => d.Data));

                var revision = (string)bookTextElem.Attribute("revision");

                if (XNode.DeepEquals(oldUsxElem, newUsxElem))
                {
                    bookText = await _paratextService.GetBookTextAsync(user, paratextId, text.BookId);
                }
                else
                {
                    bookText = await _paratextService.UpdateBookTextAsync(user, paratextId, text.BookId, revision,
                        newUsxElem.ToString());
                }
            }
            await UpdateProgress();

            bookTextElem = XElement.Parse(bookText);

            tasks.Clear();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> deltas = _deltaUsxMapper.ToChapterDeltas(paratextId,
                bookTextElem.Element("usx"));
            var chapters = new List<Chapter>();
            foreach (KeyValuePair<int, (Delta Delta, int LastVerse)> kvp in deltas)
            {
                if (textDataDocs.TryGetValue(kvp.Key, out Document<Delta> textDataDoc))
                {
                    Delta diffDelta = textDataDoc.Data.Diff(kvp.Value.Delta);
                    tasks.Add(textDataDoc.SubmitOpAsync(diffDelta));
                    textDataDocs.Remove(kvp.Key);
                }
                else if (chaptersToInclude == null || chaptersToInclude.Contains(kvp.Key))
                {
                    tasks.Add(textDataDoc.CreateAsync(kvp.Value.Delta));
                }
                chapters.Add(new Chapter { Number = kvp.Key, LastVerse = kvp.Value.LastVerse });
            }
            foreach (KeyValuePair<int, Document<Delta>> kvp in textDataDocs)
                tasks.Add(kvp.Value.DeleteAsync());
            await Task.WhenAll(tasks);
            await UpdateProgress();

            await SaveUsxFileAsync(bookTextElem, fileName);
            await UpdateProgress();
            return chapters;
        }

        private async Task<List<Chapter>> CloneBookUsxAsync(UserEntity user, Connection conn, TextEntity text,
            TextType textType, string paratextId, string fileName, ISet<int> chaptersToInclude)
        {
            string bookText = await _paratextService.GetBookTextAsync(user, paratextId, text.BookId);
            await UpdateProgress();

            var bookTextElem = XElement.Parse(bookText);

            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> deltas = _deltaUsxMapper.ToChapterDeltas(paratextId,
                bookTextElem.Element("usx"));
            var tasks = new List<Task>();
            var chapters = new List<Chapter>();
            foreach (KeyValuePair<int, (Delta Delta, int LastVerse)> kvp in deltas)
            {
                if (chaptersToInclude != null && !chaptersToInclude.Contains(kvp.Key))
                    continue;

                Document<Delta> textDataDoc = GetTextDataDocument(conn, text, kvp.Key, textType);
                tasks.Add(textDataDoc.CreateAsync(kvp.Value.Delta));
                chapters.Add(new Chapter { Number = kvp.Key, LastVerse = kvp.Value.LastVerse });
            }
            await Task.WhenAll(tasks);
            await UpdateProgress();

            await SaveUsxFileAsync(bookTextElem, fileName);
            await UpdateProgress();
            return chapters;
        }

        private async Task DeleteBookUsxAsync(Connection conn, SFProjectEntity project, TextEntity text,
            TextType textType, string paratextId)
        {
            string projectPath = GetProjectPath(project, paratextId);
            File.Delete(GetUsxFileName(projectPath, text.BookId));
            var tasks = new List<Task>();
            foreach (Chapter chapter in text.Chapters)
                tasks.Add(DeleteTextDataAsync(conn, text, chapter.Number, textType));
            await Task.WhenAll(tasks);
        }

        private async Task UpdateNotesData(Connection conn, TextEntity text, List<Chapter> newChapters)
        {
            bool chaptersChanged = false;
            var oldChapters = new HashSet<int>(text.Chapters.Select(c => c.Number));
            var tasks = new List<Task>();
            foreach (Chapter newChapter in newChapters)
            {
                if (oldChapters.Contains(newChapter.Number))
                {
                    oldChapters.Remove(newChapter.Number);
                }
                else
                {
                    Document<JToken> questionDataDoc = GetQuestionDataDocument(conn, text, newChapter.Number);
                    tasks.Add(questionDataDoc.CreateAsync(new JArray()));
                    Document<JToken> commentDataDoc = GetCommentDataDocument(conn, text, newChapter.Number);
                    tasks.Add(commentDataDoc.CreateAsync(new JArray()));
                    chaptersChanged = true;
                }
            }
            foreach (int oldChapter in oldChapters)
            {
                tasks.Add(DeleteQuestionDataAsync(conn, text, oldChapter));
                tasks.Add(DeleteCommentDataAsync(conn, text, oldChapter));
                chaptersChanged = true;
            }
            await Task.WhenAll(tasks);
            if (chaptersChanged)
                await _texts.UpdateAsync(text, u => u.Set(t => t.Chapters, newChapters));
        }

        private async Task DeleteNotesData(Connection conn, TextEntity text)
        {
            var tasks = new List<Task>();
            foreach (Chapter chapter in text.Chapters)
            {
                tasks.Add(DeleteQuestionDataAsync(conn, text, chapter.Number));
                tasks.Add(DeleteCommentDataAsync(conn, text, chapter.Number));
            }
            await Task.WhenAll(tasks);
        }

        private string GetProjectPath(SFProjectEntity project, string paratextId)
        {
            return Path.Combine(WorkingDir, project.Id, paratextId);
        }

        private string GetUsxFileName(string projectPath, string bookId)
        {
            return Path.Combine(projectPath, bookId + ".xml");
        }

        private async Task<XElement> LoadUsxFileAsync(string fileName)
        {
            using (var stream = new FileStream(fileName, FileMode.Open))
            {
                return await XElement.LoadAsync(stream, LoadOptions.None, CancellationToken.None);
            }
        }

        private async Task SaveUsxFileAsync(XElement bookTextElem, string fileName)
        {
            using (var stream = new FileStream(fileName, FileMode.Create))
            {
                await bookTextElem.SaveAsync(stream, SaveOptions.None, CancellationToken.None);
            }
        }

        private Document<Delta> GetTextDataDocument(Connection conn, TextEntity text, int chapter, TextType textType)
        {
            return conn.Get<Delta>(SFDataAccessConstants.TextDataCollectionName,
                TextEntity.GetTextDataId(text.Id, chapter, textType));
        }

        private Document<JToken> GetQuestionDataDocument(Connection conn, TextEntity text, int chapter)
        {
            return conn.Get<JToken>(SFDataAccessConstants.QuestionDataCollectionName,
                TextEntity.GetJsonDataId(text.Id, chapter));
        }

        private Document<JToken> GetCommentDataDocument(Connection conn, TextEntity text, int chapter)
        {
            return conn.Get<JToken>(SFDataAccessConstants.CommentDataCollectionName,
                TextEntity.GetJsonDataId(text.Id, chapter));
        }

        private IEnumerable<string> GetBooksToDelete(SFProjectEntity project, string paratextId,
            IEnumerable<string> books)
        {
            string projectPath = GetProjectPath(project, paratextId);
            var booksToDelete = new HashSet<string>(Directory.Exists(projectPath)
                ? Directory.EnumerateFiles(projectPath).Select(Path.GetFileNameWithoutExtension)
                : Enumerable.Empty<string>());
            booksToDelete.ExceptWith(books);
            return booksToDelete;
        }

        private async Task DeleteTextDataAsync(Connection conn, TextEntity text, int chapter, TextType textType)
        {
            Document<Delta> textDataDoc = GetTextDataDocument(conn, text, chapter, textType);
            await textDataDoc.FetchAsync();
            await textDataDoc.DeleteAsync();
        }

        private async Task DeleteQuestionDataAsync(Connection conn, TextEntity text, int chapter)
        {
            Document<JToken> questionDataDoc = GetQuestionDataDocument(conn, text, chapter);
            await questionDataDoc.FetchAsync();
            await questionDataDoc.DeleteAsync();
        }

        private async Task DeleteCommentDataAsync(Connection conn, TextEntity text, int chapter)
        {
            Document<JToken> commentDataDoc = GetCommentDataDocument(conn, text, chapter);
            await commentDataDoc.FetchAsync();
            await commentDataDoc.DeleteAsync();
        }

        private async Task UpdateProgress()
        {
            _step++;
            double percentCompleted = (double)_step / _stepCount;
            _job = await _jobs.UpdateAsync(_job, u => u
                .Set(j => j.PercentCompleted, percentCompleted));
        }
    }
}
