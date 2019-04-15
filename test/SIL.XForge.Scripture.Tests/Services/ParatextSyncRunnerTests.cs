using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using NSubstitute;
using NUnit.Framework;
using ShareDB;
using ShareDB.RichText;
using SIL.Machine.WebApi.Services;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Realtime;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    [TestFixture]
    public class ParatextSyncRunnerTests
    {
        [Test]
        public async Task SyncOrClone_YesFileYesDb()
        {
            var env = new TestEnvironment();

            env.Connection.Get<Delta>(null, null).ReturnsForAnyArgs(env.Document);

            var newFileBuffer = new byte[1000];
            var newFileStream = new MemoryStream(newFileBuffer);
            env.FileSystemService.CreateFile(Arg.Any<string>()).Returns(newFileStream);
            env.FileSystemService.FileExists(Arg.Any<string>()).Returns(true);

            string fileOnDisk = env.usxText;
            var loadStream = new MemoryStream(Encoding.UTF8.GetBytes(fileOnDisk));
            env.FileSystemService.OpenFile(Arg.Any<string>(), Arg.Any<FileMode>()).Returns(loadStream);

            List<Chapter> resultingChapters = await env.Runner.SyncOrCloneBookUsxAsync(null, env.Connection,
                env.Project, env.Text, TextType.Source, env.Project.ParatextId, false);
            var unionOfParatextCloudAndMongoChapters = 2;
            Assert.That(resultingChapters.Count, Is.EqualTo(unionOfParatextCloudAndMongoChapters),
                "Did not process data as expected");

            // Assert that PT cloud was updated from mongo
            await env.ParatextService.ReceivedWithAnyArgs().UpdateBookTextAsync(null, null, null, null, null);

            var textWrittenToDisk = System.Text.Encoding.UTF8.GetString(newFileStream.ToArray());
            Assert.That(textWrittenToDisk, Does.Contain("<usx"));

            // Assert that mongo was updated
            await env.Document.ReceivedWithAnyArgs().SubmitOpAsync(null);

        }

        [Test]
        public async Task SyncOrClone_NoFileNoDB()
        {
            var env = new TestEnvironment();

            env.Connection.Get<Delta>("abc", "abc").ReturnsForAnyArgs(env.EmptyDocument);

            var newFileBuffer = new byte[1000];
            var newFileStream = new MemoryStream(newFileBuffer);
            env.FileSystemService.CreateFile(Arg.Any<string>()).Returns(newFileStream);
            env.FileSystemService.FileExists(Arg.Any<string>()).Returns(false);

            string fileOnDisk = env.usxText;
            var loadStream = new MemoryStream(Encoding.UTF8.GetBytes(fileOnDisk));
            env.FileSystemService.OpenFile(Arg.Any<string>(), Arg.Any<FileMode>()).Returns(loadStream);

            List<Chapter> resultingChapters = await env.Runner.SyncOrCloneBookUsxAsync(null, env.Connection,
                env.Project, env.Text, TextType.Source, env.Project.ParatextId, false);
            var unionOfParatextCloudAndMongoChapters = 2;
            Assert.That(resultingChapters.Count, Is.EqualTo(unionOfParatextCloudAndMongoChapters),
                "Did not process data as expected");

            // Assert that PT cloud was not written to
            await env.ParatextService.DidNotReceiveWithAnyArgs().UpdateBookTextAsync(null, null, null, null, null);

            var textWrittenToDisk = Encoding.UTF8.GetString(newFileStream.ToArray());
            Assert.That(textWrittenToDisk, Does.Contain("<usx"));

            // Assert that data was created in mongo
            await env.EmptyDocument.Received().CreateAsync(Arg.Any<Delta>());
        }

        [Test]
        public async Task SyncOrClone_NoFileYesDb()
        {
            var env = new TestEnvironment();

            env.Connection.Get<Delta>(null, null).ReturnsForAnyArgs(env.Document);

            var newFileBuffer = new byte[1000];
            var newFileStream = new MemoryStream(newFileBuffer);
            env.FileSystemService.CreateFile(Arg.Any<string>()).Returns(newFileStream);
            env.FileSystemService.FileExists(Arg.Any<string>()).Returns(false);

            List<Chapter> resultingChapters = await env.Runner.SyncOrCloneBookUsxAsync(null, env.Connection,
                env.Project, env.Text, TextType.Source, env.Project.ParatextId, false);
            var unionOfParatextCloudAndMongoChapters = 2;
            Assert.That(resultingChapters.Count, Is.EqualTo(unionOfParatextCloudAndMongoChapters),
                "Did not process data as expected");

            // Assert that PT cloud was not written to
            await env.ParatextService.DidNotReceiveWithAnyArgs().UpdateBookTextAsync(null, null, null, null, null);

            var textWrittenToDisk = Encoding.UTF8.GetString(newFileStream.ToArray());
            Assert.That(textWrittenToDisk, Does.Contain("<usx"));

            // Assert that mongo text_data records were deleted and re-created.
            await env.Document.ReceivedWithAnyArgs().DeleteAsync();
            await env.Document.ReceivedWithAnyArgs().CreateAsync(Arg.Any<Delta>());
        }

        [Test]
        public async Task FetchAndSaveBook()
        {
            var env = new TestEnvironment();
            var buffer = new byte[1000];
            var steamToDisk = new MemoryStream(buffer);
            env.FileSystemService.CreateFile("/nonexistent/path.xml").Returns(steamToDisk);

            var text = new TextEntity { BookId = "abc" };
            var outputUsx = await env.Runner.FetchAndSaveBookUsxAsync(null, text, null, "/nonexistent/path.xml");
            var textWrittenToDisk = Encoding.UTF8.GetString(steamToDisk.ToArray());
            Assert.That(textWrittenToDisk, Does.Contain("<usx"));
            Assert.That(outputUsx.Name.ToString(), Is.EqualTo("BookText"));
        }

        private class TestEnvironment
        {
            public string usxText = "<BookText><usx version=\"2.5\">\n  <book code=\"PHM\" style=\"id\" />\n  <chapter number=\"1\" style=\"c\" />\n  <verse number=\"1\" style=\"v\" />This is verse 1.<verse number=\"2\" style=\"v\" /><verse number=\"3\" style=\"v\" />This is verse 3.<chapter number=\"2\" style=\"c\" /><verse number=\"1\" style=\"v\" /><verse number=\"2-3\" style=\"v\" /></usx></BookText>";

            public TestEnvironment()
            {
                Document = Substitute.For<IDocument<Delta>>();
                Document.CreateAsync(null as Delta).ReturnsForAnyArgs(true);
                Document.FetchAsync().ReturnsForAnyArgs(true);
                Document.Data.Returns(Delta.New()
                    .InsertChapter("1")
                    .InsertVerse("1")
                    .InsertText("This is verse 1.", "verse_1_1")
                    .InsertVerse("2")
                    .InsertBlank("verse_1_2")
                    .InsertVerse("3")
                    .InsertText("This is verse 3.", "verse_1_3")
                    .Insert("\n"));
                Document.SubmitOpAsync(null as Delta).ReturnsForAnyArgs(true);
                Document.DeleteAsync().ReturnsForAnyArgs(true);

                EmptyDocument = Substitute.For<IDocument<Delta>>();
                EmptyDocument.CreateAsync(null as Delta).ReturnsForAnyArgs(true);

                Connection = Substitute.For<IConnection>();

                IOptions<SiteOptions> siteOptions = Microsoft.Extensions.Options.Options.Create(
                    new SiteOptions()
                    {
                        SiteDir = "/tmp/ResourceServiceTests/site"
                    });
                var users = new MemoryRepository<UserEntity>();
                Jobs = new MemoryRepository<SyncJobEntity>(new[]
                    {
                        new SyncJobEntity { Id = "1234" }
                    });
                Projects = new MemoryRepository<SFProjectEntity>(new[]
                    {
                        new SFProjectEntity
                        {
                            Id = "project01",
                            ProjectName = "project01",
                            Users =
                            {
                                new SFProjectUserEntity
                                {
                                    Id = "projectuser01",
                                    UserRef = "user01",
                                    Role = SFProjectRoles.Administrator
                                }
                            },
                            ParatextId="abc123"
                        }
                    });
                Texts = new MemoryRepository<TextEntity>(new[]
                    {
                        new TextEntity
                        {
                            BookId = "abc",
                            Id = "text03",
                            ProjectRef = "project02",
                            Chapters =
                            {
                                new Chapter { Number = 1, LastVerse = 3 },
                                new Chapter { Number = 2, LastVerse = 3 }
                            }
                        }
                    });
                var engineService = Substitute.For<IEngineService>();
                ParatextService = Substitute.For<IParatextService>();
                ParatextService.GetBookTextAsync(null, null, null).ReturnsForAnyArgs(usxText);
                ParatextService.UpdateBookTextAsync(null, null, null, null, null).ReturnsForAnyArgs(usxText);
                var realtimeService = Substitute.For<IRealtimeService>();
                FileSystemService = Substitute.For<IFileSystemService>();
                var logger = Substitute.For<ILogger<ParatextSyncRunner>>();

                Runner = new ParatextSyncRunner(siteOptions, users, Jobs, Projects, Texts, engineService,
                    ParatextService, realtimeService, FileSystemService, logger);
                Runner._job = Jobs.Get("1234");
            }

            public IConnection Connection { get; }
            public IDocument<Delta> Document { get; }
            public IDocument<Delta> EmptyDocument { get; }
            public ParatextSyncRunner Runner { get; }
            public MemoryRepository<SyncJobEntity> Jobs { get; }
            public MemoryRepository<SFProjectEntity> Projects { get; }
            public MemoryRepository<TextEntity> Texts { get; }
            public IParatextService ParatextService { get; }
            public IFileSystemService FileSystemService { get; }
            public SFProjectEntity Project => Projects.Get("project01");
            public TextEntity Text => Texts.Get("text03");
        }
    }
}
