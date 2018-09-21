using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Models;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    [TestFixture]
    public class ProjectServiceTests
    {
        [Test]
        public async Task UpdateAsync_UserRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("project-name"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestProjectResource
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
            TestProjectResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.ProjectName, Is.EqualTo("new"));
        }

        [Test]
        public async Task UpdateAsync_SystemAdminRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("project-name"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestProjectResource
            {
                Id = "project02",
                ProjectName = "new"
            };

            TestProjectResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.ProjectName, Is.EqualTo("new"));
        }

        [Test]
        public async Task GetAsync_UserRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);
            env.JsonApiContext.QuerySet.Returns(new QuerySet());
            env.JsonApiContext.PageManager.Returns(new PageManager());

            TestProjectResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "project01", "project03" }));
        }

        [Test]
        public async Task GetAsync_SystemAdminRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);
            env.JsonApiContext.QuerySet.Returns(new QuerySet());
            env.JsonApiContext.PageManager.Returns(new PageManager());

            TestProjectResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "project01", "project02", "project03" }));
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<TestProjectResource, TestProjectEntity>
        {
            public TestEnvironment()
                : base("projects")
            {
                Service = new TestProjectService(JsonApiContext, Entities, Mapper, UserAccessor);
            }

            public TestProjectService Service { get; }

            protected override IEnumerable<TestProjectEntity> GetInitialData()
            {
                return new[]
                {
                    new TestProjectEntity
                    {
                        Id = "project01",
                        ProjectName = "project01",
                        Users = { { "user01", new ProjectRole(TestProjectRoles.Manager) } }
                    },
                    new TestProjectEntity
                    {
                        Id = "project02",
                        ProjectName = "project02",
                        Users = { { "user02", new ProjectRole(TestProjectRoles.Manager) } }
                    },
                    new TestProjectEntity
                    {
                        Id = "project03",
                        ProjectName = "project03",
                        Users = { { "user01", new ProjectRole(TestProjectRoles.Manager) } }
                    }
                };
            }
        }
    }
}
