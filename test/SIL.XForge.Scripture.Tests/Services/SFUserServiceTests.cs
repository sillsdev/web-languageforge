using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    [TestFixture]
    public class SFUserServiceTests
    {
        [Test]
        public void UpdateRelationshipsAsync_ProjectsNotAllowed()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.UpdateRelationshipsAsync("user01", "projects",
                        new List<ResourceObject> { new ResourceObject { Type = "projects", Id = "projectuser02" } });
                });

            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status405MethodNotAllowed));
        }

        [Test]
        public async Task GetRelationshipsAsync_Projects()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            object resources = await env.Service.GetRelationshipsAsync("user01", "projects");

            Assert.That(resources, Is.Not.Null);
            var projectResources = (IEnumerable<IResource>) resources;
            Assert.That(projectResources.Select(p => p.Id), Is.EqualTo(new[] { "projectuser01", "projectuser02" }));
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<SFUserResource, UserEntity>
        {
            public TestEnvironment()
                : base("users")
            {
                var projects = new MemoryRepository<SFProjectEntity>(new[]
                    {
                        new SFProjectEntity
                        {
                            Id = "project01",
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
                            Users =
                            {
                                new SFProjectUserEntity
                                {
                                    Id = "projectuser02",
                                    UserRef = "user01",
                                    Role = SFProjectRoles.Administrator
                                }
                            }
                        }
                    });

                Service = new SFUserService(JsonApiContext, Mapper, UserAccessor, Entities, Options)
                {
                    ProjectUserMapper = new SFProjectUserService(JsonApiContext, Mapper, UserAccessor, projects,
                        Entities, Substitute.For<IParatextService>())
                };
            }

            public SFUserService Service { get; }

            protected override IEnumerable<UserEntity> GetInitialData()
            {
                return new[]
                {
                    new UserEntity { Id = "user01", Username = "user01" },
                    new UserEntity { Id = "user02", Username = "user02" },
                    new UserEntity { Id = "user03", Username = "user03" }
                };
            }
        }
    }
}
