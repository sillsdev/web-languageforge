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
    public class UserServiceTests
    {
        [Test]
        public void CreateAsync_UserRole()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.User);

            var resource = new TestUserResource
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

            var userResource = new TestUserResource
            {
                Id = "usernew"
            };
            UserResource newResource = await env.Service.CreateAsync(userResource);

            Assert.That(newResource, Is.Not.Null);
        }

        [Test]
        public async Task CreateAsync_Email()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);

            var userResource = new TestUserResource
            {
                Id = "usernew",
                Email = "UserNew@gmail.com"
            };
            UserResource newResource = await env.Service.CreateAsync(userResource);

            Assert.That(newResource, Is.Not.Null);
            Assert.That(newResource.Email, Is.EqualTo("UserNew@gmail.com"));
            Assert.That(newResource.CanonicalEmail, Is.EqualTo("usernew@gmail.com"));
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

            var resource = new TestUserResource
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

            var resource = new TestUserResource
            {
                Id = "user02",
                Username = "new"
            };

            UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Username, Is.EqualTo("new"));
        }

        [Test]
        public async Task UpdateAsync_Email()
        {
            var env = new TestEnvironment();
            env.SetUser("user01", SystemRoles.SystemAdmin);
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("email"), "New@gmail.com" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestUserResource
            {
                Id = "user01",
                Email = "New@gmail.com"
            };
            UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Email, Is.EqualTo("New@gmail.com"));
            Assert.That(updatedResource.CanonicalEmail, Is.EqualTo("new@gmail.com"));
        }

        [Test]
        public async Task UpdateAsync_UnlinkParatextAccount()
        {
            var env = new TestEnvironment();
            env.SetUser("paratextuser01", SystemRoles.User);

            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
            {
                { env.GetAttribute("paratext-id"), null }
            });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

            var resource = new TestUserResource
            {
                Id = "paratextuser01",
                ParatextId = null,
            };
            UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);
            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.ParatextId, Is.Null);
            // Unsetting the paratext-id should also unset paratext tokens
            UserEntity paratextUser = await env.Service.GetEntityAsync("paratextuser01");
            Assert.That(paratextUser.ParatextTokens, Is.Null);
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

            Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "user01", "user02", "user03", "paratextuser01" }));
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<UserResource, UserEntity>
        {
            public TestEnvironment()
                : base("users")
            {
                Service = new TestUserService(JsonApiContext, Mapper, UserAccessor, Entities);
            }

            public TestUserService Service { get; }

            protected override IEnumerable<UserEntity> GetInitialData()
            {
                return new[]
                {
                    new UserEntity
                    {
                        Id = "user01",
                        Username = "user01",
                        Email = "user01@gmail.com",
                        CanonicalEmail = "user01@gmail.com"
                    },
                    new UserEntity
                    {
                        Id = "user02",
                        Username = "user02",
                        Email = "user02@gmail.com",
                        CanonicalEmail = "user02@gmail.com"
                    },
                    new UserEntity
                    {
                        Id = "user03",
                        Username = "user03",
                        Email = "user03@gmail.com",
                        CanonicalEmail = "user03@gmail.com"
                    },
                    new UserEntity
                    {
                        Id = "paratextuser01",
                        Username = "paratextuser01",
                        Email = "paratextuser01@example.com",
                        CanonicalEmail = "paratextuser01@example.com",
                        ParatextId = "paratextuser01id",
                        ParatextTokens = new Tokens
                        {
                            AccessToken = "paratextuser01accesstoken",
                            RefreshToken = "paratextuser01refreshtoken"
                        }
                    }
                };
            }
        }
    }
}
