using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Builders;
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
    public class UserServiceTests
    {
        [Test]
        public void CreateAsync_UserRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var resource = new UserResource
            {
                Id = "usernew"
            };
            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.CreateAsync(resource);
                });
            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status403Forbidden));
        }

        [Test]
        public async Task CreateAsync_SystemAdminRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);

            var userResource = new UserResource
            {
                Id = "usernew"
            };
            UserResource newResource = await env.Service.CreateAsync(userResource);

            Assert.That(newResource, Is.Not.Null);
        }

        [Test]
        public async Task UpdateAsync_UserRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("username"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new UserResource
            {
                Id = "user02",
                Username = "new"
            };
            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.UpdateAsync(resource.Id, resource);
                });
            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status403Forbidden));

            resource.Id = "user01";
            UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Username, Is.EqualTo("new"));
        }

        [Test]
        public async Task UpdateAsync_SystemAdminRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("username"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new UserResource
            {
                Id = "user02",
                Username = "new"
            };

            UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Username, Is.EqualTo("new"));
        }

        [Test]
        public async Task GetAsync_UserRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.QuerySet.Returns(new QuerySet());
            env.JsonApiContext.PageManager.Returns(new PageManager());

            UserResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "user01" }));
        }

        [Test]
        public async Task GetAsync_SystemAdminRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);
            env.JsonApiContext.QuerySet.Returns(new QuerySet());
            env.JsonApiContext.PageManager.Returns(new PageManager());

            UserResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "user01", "user02", "user03" }));
        }

        [Test]
        public void UpdateRelationshipsAsync_ProjectsNotAllowed()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.UpdateRelationshipsAsync("user01", UserResource.ProjectsRelationship,
                        new List<DocumentData> { new DocumentData { Type = "projects", Id = "project02" } });
                });
            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status405MethodNotAllowed));
        }

        [Test]
        public async Task GetRelationshipsAsync_Projects()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            object resources = await env.Service.GetRelationshipsAsync("user01", UserResource.ProjectsRelationship);

            Assert.That(resources, Is.Not.Null);
            var projectResources = (IEnumerable<Resource>) resources;
            Assert.That(projectResources.Select(p => p.Id), Is.EqualTo(new[] { "project01", "project02" }));
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<UserResource, UserEntity>
        {
            public TestEnvironment()
                : base("users")
            {
                var projects = new MemoryRepository<TestProjectEntity>(new[]
                    {
                        new TestProjectEntity
                        {
                            Id = "project01",
                            Users = { { "user01", new ProjectRole(TestProjectRoles.Manager) } }
                        },
                        new TestProjectEntity
                        {
                            Id = "project02",
                            Users = { { "user01", new ProjectRole(TestProjectRoles.Manager) } }
                        }
                    });

                Service = new TestUserService(JsonApiContext, Entities, Mapper, UserAccessor)
                {
                    ProjectResourceMapper = new TestProjectService(JsonApiContext, projects, Mapper, UserAccessor)
                };
            }

            public TestUserService Service { get; }

            protected override IEnumerable<UserEntity> GetInitialData()
            {
                return new[]
                {
                    new UserEntity { Id = "user01", Username = "user01" },
                    new UserEntity { Id = "user02", Username = "user02" },
                    new UserEntity { Id = "user03", Username = "user03" }
                };
            }

            protected override void SetupContextGraph(IContextGraphBuilder builder)
            {
                builder.AddResource<TestProjectResource, string>("projects");
            }

            protected override void SetupMapper(IMapperConfigurationExpression config)
            {
                config.CreateMap<TestProjectEntity, TestProjectResource>()
                    .ReverseMap();
            }
        }
    }
}
