using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Models;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    [TestFixture]
    public class ProjectDataServiceBaseTests
    {
        [Test]
        public async Task CreateAsync_HasRight()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var resource = new TestProjectDataResource
            {
                Id = "testnew",
                Str = "new",
                ProjectRef = "project01",
                OwnerRef = "user01"
            };
            TestProjectDataResource newResource = await env.Service.CreateAsync(resource);

            Assert.That(newResource, Is.Not.Null);
        }

        [Test]
        public void CreateAsync_NoRight()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var resource = new TestProjectDataResource
            {
                Id = "testnew",
                Str = "new",
                ProjectRef = "project02",
                OwnerRef = "user01"
            };
            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.CreateAsync(resource);
                });

            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status403Forbidden));
        }

        [Test]
        public void CreateAsync_ProjectNotSet()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var resource = new TestProjectDataResource
            {
                Id = "testnew",
                Str = "new",
                OwnerRef = "user01"
            };
            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.CreateAsync(resource);
                });

            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status400BadRequest));
        }

        [Test]
        public void CreateAsync_IncorrectOwner()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var resource = new TestProjectDataResource
            {
                Id = "testnew",
                Str = "new",
                ProjectRef = "project01",
                OwnerRef = "user02"
            };
            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.CreateAsync(resource);
                });

            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status400BadRequest));
        }

        [Test]
        public async Task UpdateAsync_HasRight()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("str"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestProjectDataResource
            {
                Id = "test01",
                Str = "new"
            };
            TestProjectDataResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Str, Is.EqualTo("new"));
        }

        [Test]
        public async Task UpdateAsync_HasOwnRight()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("str"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestProjectDataResource
            {
                Id = "test03",
                Str = "new"
            };
            TestProjectDataResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Str, Is.EqualTo("new"));
        }

        [Test]
        public void UpdateAsync_NoRight()
        {
            var env = new TestEnvironment();
            env.SetUser("user02", SystemRoles.User);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("str"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestProjectDataResource
            {
                Id = "test01",
                Str = "new"
            };
            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.UpdateAsync(resource.Id, resource);
                });

            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status403Forbidden));
        }

        [Test]
        public async Task GetAsync()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.QuerySet.Returns(new QuerySet());
            env.JsonApiContext.PageManager.Returns(new PageManager());

            TestProjectDataResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[]
                {
                    "test01", "test03", "test04", "test07", "test09", "test10"
                }));
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<TestProjectDataResource, TestProjectDataEntity>
        {
            public TestEnvironment()
                : base("tests")
            {
                var projects = new MemoryRepository<TestProjectEntity>(new[]
                    {
                        new TestProjectEntity
                        {
                            Id = "project01",
                            ProjectName = "project01",
                            Users =
                            {
                                new ProjectUserEntity
                                {
                                    Id = "projectuser01",
                                    UserRef = "user01",
                                    Role = TestProjectRoles.Manager
                                },
                                new ProjectUserEntity
                                {
                                    Id = "projectuser02",
                                    UserRef = "user02",
                                    Role = TestProjectRoles.Contributor
                                }
                            }
                        },
                        new TestProjectEntity
                        {
                            Id = "project02",
                            ProjectName = "project02",
                            Users =
                            {
                                new ProjectUserEntity
                                {
                                    Id = "projectuser03",
                                    UserRef = "user02",
                                    Role = TestProjectRoles.Manager
                                }
                            }
                        },
                        new TestProjectEntity
                        {
                            Id = "project03",
                            ProjectName = "project03",
                            Users =
                            {
                                new ProjectUserEntity
                                {
                                    Id = "projectuser04",
                                    UserRef = "user01",
                                    Role = TestProjectRoles.Contributor
                                },
                                new ProjectUserEntity
                                {
                                    Id = "projectuser05",
                                    UserRef = "user02",
                                    Role = TestProjectRoles.Manager
                                }
                            }
                        }
                    });

                Service = new TestProjectDataService(JsonApiContext, Mapper, UserAccessor, Entities, projects);
            }

            public TestProjectDataService Service { get; }

            protected override IEnumerable<TestProjectDataEntity> GetInitialData()
            {
                return new[]
                {
                    new TestProjectDataEntity { Id = "test01", ProjectRef = "project01", OwnerRef = "user01" },
                    new TestProjectDataEntity { Id = "test02", ProjectRef = "project02", OwnerRef = "user02" },
                    new TestProjectDataEntity { Id = "test03", ProjectRef = "project03", OwnerRef = "user01" },
                    new TestProjectDataEntity { Id = "test04", ProjectRef = "project01", OwnerRef = "user02" },
                    new TestProjectDataEntity { Id = "test05", ProjectRef = "project02", OwnerRef = "user02" },
                    new TestProjectDataEntity { Id = "test06", ProjectRef = "project03", OwnerRef = "user02" },
                    new TestProjectDataEntity { Id = "test07", ProjectRef = "project01", OwnerRef = "user01" },
                    new TestProjectDataEntity { Id = "test08", ProjectRef = "project02", OwnerRef = "user02" },
                    new TestProjectDataEntity { Id = "test09", ProjectRef = "project03", OwnerRef = "user01" },
                    new TestProjectDataEntity { Id = "test10", ProjectRef = "project01", OwnerRef = "user02" }
                };
            }
        }
    }
}
