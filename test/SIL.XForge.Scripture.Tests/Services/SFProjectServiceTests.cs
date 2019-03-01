using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Models;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using NUnit.Framework;
using SIL.Machine.WebApi.Services;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    [TestFixture]
    public class SFProjectServiceTests
    {
        [Test]
        public async Task UpdateAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.User);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("project-name"), "new" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new SFProjectResource
                {
                    Id = "project02",
                    ProjectName = "new"
                };
                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                    {
                        await env.Service.UpdateAsync(resource.Id, resource);
                    });

                Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status403Forbidden));

                resource.Id = "project01";
                SFProjectResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.ProjectName, Is.EqualTo("new"));
            }
        }

        [Test]
        public async Task UpdateAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("project-name"), "new" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new SFProjectResource
                {
                    Id = "project02",
                    ProjectName = "new"
                };

                SFProjectResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.ProjectName, Is.EqualTo("new"));
            }
        }

        [Test]
        public async Task GetAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.User);
                env.JsonApiContext.QuerySet.Returns(new QuerySet());
                env.JsonApiContext.PageManager.Returns(new PageManager());

                SFProjectResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "project01", "project03" }));
            }
        }

        [Test]
        public async Task GetAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.SystemAdmin);
                env.JsonApiContext.QuerySet.Returns(new QuerySet());
                env.JsonApiContext.PageManager.Returns(new PageManager());

                SFProjectResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[]
                    {
                        "project01",
                        "project02",
                        "project03"
                    }));
            }
        }

        [Test]
        public async Task DeleteAsync()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.User);
                env.CreateSiteDir();
                string syncDir = Path.Combine(TestEnvironment.SiteDir, "sync", "project01");
                Directory.CreateDirectory(syncDir);
                bool result = await env.Service.DeleteAsync("project01");

                Assert.That(result, Is.True);
                Assert.That(env.Entities.Contains("project01"), Is.False);
                await env.SyncJobMapper.Received().DeleteAllAsync("project01");
                await env.TextMapper.Received().DeleteAllAsync("project01");
                await env.QuestionMapper.Received().DeleteAllAsync("project01");
                await env.EngineService.Received().RemoveProjectAsync("project01");
                Assert.That(Directory.Exists(syncDir), Is.False);
            }
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<SFProjectResource, SFProjectEntity>
        {
            public TestEnvironment()
                : base("projects")
            {
                EngineService = Substitute.For<IEngineService>();
                SyncJobMapper = Substitute.For<IProjectDataMapper<SyncJobResource, SyncJobEntity>>();
                TextMapper = Substitute.For<IProjectDataMapper<TextResource, TextEntity>>();
                QuestionMapper = Substitute.For<IProjectDataMapper<QuestionResource, QuestionEntity>>();
                Service = new SFProjectService(JsonApiContext, Mapper, UserAccessor, Entities, EngineService,
                    SiteOptions)
                {
                    SyncJobMapper = SyncJobMapper,
                    TextMapper = TextMapper,
                    QuestionMapper = QuestionMapper
                };
            }

            public SFProjectService Service { get; }
            public IEngineService EngineService { get; }
            public IProjectDataMapper<SyncJobResource, SyncJobEntity> SyncJobMapper { get; }
            public IProjectDataMapper<TextResource, TextEntity> TextMapper { get; }
            public IProjectDataMapper<QuestionResource, QuestionEntity> QuestionMapper { get; }

            protected override IEnumerable<SFProjectEntity> GetInitialData()
            {
                return new[]
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
                        }
                    },
                    new SFProjectEntity
                    {
                        Id = "project02",
                        ProjectName = "project02",
                        Users =
                        {
                            new SFProjectUserEntity
                            {
                                Id = "projectuser02",
                                UserRef = "user02",
                                Role = SFProjectRoles.Administrator
                            }
                        }
                    },
                    new SFProjectEntity
                    {
                        Id = "project03",
                        ProjectName = "project03",
                        Users =
                        {
                            new SFProjectUserEntity
                            {
                                Id = "projectuser03",
                                UserRef = "user01",
                                Role = SFProjectRoles.Administrator
                            }
                        }
                    }
                };
            }

            protected override void SetupMapper(IMapperConfigurationExpression config)
            {
                config.AddProfile<SFMapperProfile>();
            }
        }
    }
}
