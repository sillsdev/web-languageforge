using System.Collections.Generic;
using System.Threading.Tasks;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.DataAccess;
using SIL.XForge.Realtime;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    [TestFixture]
    public class TextServiceTests
    {
        [Test]
        public async Task DeleteAllAsync()
        {
            var env = new TestEnvironment();

            await env.Service.DeleteAllAsync("project01");

            var expectedTextIds = new HashSet<string>
            {
                "text01:source",
                "text01:target",
                "text02:source",
                "text02:target"
            };
            var expectedQuestionIds = new HashSet<string>
            {
                "text01",
                "text02"
            };
            await env.RealtimeService.Received().DeleteAllAsync("text",
                Arg.Is<IEnumerable<string>>(ids => expectedTextIds.SetEquals(ids)));
            await env.RealtimeService.Received().DeleteAllAsync("question",
                Arg.Is<IEnumerable<string>>(ids => expectedQuestionIds.SetEquals(ids)));
            Assert.That(env.Entities.Contains("text01"), Is.False);
            Assert.That(env.Entities.Contains("text02"), Is.False);
            Assert.That(env.Entities.Contains("text03"), Is.True);
        }


        class TestEnvironment : ResourceServiceTestEnvironmentBase<TextResource, TextEntity>
        {
            public TestEnvironment()
                : base("projects")
            {
                var projects = new MemoryRepository<SFProjectEntity>();
                RealtimeService = Substitute.For<IRealtimeService>();
                Service = new TextService(JsonApiContext, Mapper, UserAccessor, Entities, projects, RealtimeService);
            }

            public TextService Service { get; }
            public IRealtimeService RealtimeService { get; }

            protected override IEnumerable<TextEntity> GetInitialData()
            {
                return new[]
                {
                    new TextEntity
                    {
                        Id = "text01",
                        ProjectRef = "project01"
                    },
                    new TextEntity
                    {
                        Id = "text02",
                        ProjectRef = "project01"
                    },
                    new TextEntity
                    {
                        Id = "text03",
                        ProjectRef = "project02"
                    }
                };
            }
        }
    }
}
