using System;
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
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    [TestFixture]
    public class UserServiceTests
    {
        private const string ParatextUserId = "paratextuser01";
        private const string User01Id = "user01";
        private const string User02Id = "user02";
        private const string User01Email = "user01@example.com";

        [Test]
        public void CreateAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.User);

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
        }

        [Test]
        public async Task CreateAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew"
                };
                UserResource newResource = await env.Service.CreateAsync(userResource);

                Assert.That(newResource, Is.Not.Null);
            }
        }

        [Test]
        public async Task CreateAsync_CaseInsensitiveUsername()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew",
                    Username = "USER_01"
                };
                UserResource newResource = await env.Service.CreateAsync(userResource);

                Assert.That(newResource, Is.Not.Null);
                Assert.That(newResource.Username, Is.EqualTo("user_01"));
            }
        }

        [Test]
        public async Task CreateAsync_Email()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew",
                    Email = "UserNew@example.com"
                };
                UserResource newResource = await env.Service.CreateAsync(userResource);

                Assert.That(newResource, Is.Not.Null);
                Assert.That(newResource.Email, Is.EqualTo("UserNew@example.com"));
                Assert.That(newResource.CanonicalEmail, Is.EqualTo("usernew@example.com"));
            }
        }

        [Test]
        public void CreateAsync_Email_Conflict()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew",
                    Email = User01Email
                };
                var exc = Assert.ThrowsAsync<JsonApiException>(() => env.Service.CreateAsync(userResource));
                Assert.That(exc.GetStatusCode(), Is.EqualTo(StatusCodes.Status409Conflict));
            }
        }

        [Test]
        public async Task CreateAsync_ContactMethod()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew",
                    MobilePhone = "+1 234 567 8900",
                    ContactMethod = "sms"
                };
                UserResource newResource = await env.Service.CreateAsync(userResource);

                Assert.That(newResource, Is.Not.Null);
                Assert.That(newResource.ContactMethod, Is.EqualTo(UserEntity.ContactMethods.sms.ToString()));
            }
        }

        [Test]
        public async Task CreateAsync_ContactMethod_Default()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew",
                    MobilePhone = "+1 234 567 8900"
                };
                UserResource newResource = await env.Service.CreateAsync(userResource);

                Assert.That(newResource, Is.Not.Null);
                Assert.That(newResource.ContactMethod, Is.EqualTo(UserEntity.ContactMethods.email.ToString()),
                    "should be default");
            }
        }

        [Test]
        public async Task UpdateAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.User);
                UserEntity initialEntity = await env.Service.GetEntityAsync(User01Id);
                Assert.That(initialEntity.Username, Is.Not.EqualTo("new"));

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("username"), "new" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User02Id,
                    Username = "new"
                };
                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                    {
                        await env.Service.UpdateAsync(resource.Id, resource);
                    });

                Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status403Forbidden),
                    "should be forbidden to update others' accounts");

                resource.Id = User01Id;
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Username, Is.EqualTo("new"), "should be permitted to update own account");
            }
        }

        [Test]
        public async Task UpdateAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                UserEntity initialEntity = await env.Service.GetEntityAsync(User02Id);
                Assert.That(initialEntity.Username, Is.Not.EqualTo("new"));

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("username"), "new" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User02Id,
                    Username = "new"
                };

                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Username, Is.EqualTo("new"));
            }
        }

        [Test]
        public async Task UpdateAsync_CaseInsensitiveUsername()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("username"), "USER_01" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User01Id,
                    Username = "USER_01"
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Username, Is.EqualTo("user_01"));
            }
        }

        [Test]
        public async Task UpdateAsync_Email()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                UserEntity initialEntity = await env.Service.GetEntityAsync(User01Id);
                Assert.That(initialEntity.CanonicalEmail, Is.Not.EqualTo("new@example.com"));

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("email"), "New@example.com" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User01Id,
                    Email = "New@example.com"
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Email, Is.EqualTo("New@example.com"));
                Assert.That(updatedResource.CanonicalEmail, Is.EqualTo("new@example.com"));
            }
        }

        [Test]
        public void UpdateAsync_Email_Conflict()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("email"), User01Email }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User02Id,
                    Email = User01Email
                };

                var exception = Assert.ThrowsAsync<JsonApiException>(
                    () => env.Service.UpdateAsync(resource.Id, resource));
                Assert.That(exception.GetStatusCode(), Is.EqualTo(StatusCodes.Status409Conflict));
            }
        }

        [Test]
        public async Task UpdateAsync_ContactMethod()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                UserEntity initialEntity = await env.Service.GetEntityAsync(User01Id);
                Assert.That(initialEntity.ContactMethod, Is.Not.EqualTo(UserEntity.ContactMethods.emailSms));

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    {env.GetAttribute("contact-method"), "emailSms"}
                });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User01Id,
                    ContactMethod = "emailSms"
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.ContactMethod, Is.EqualTo(UserEntity.ContactMethods.emailSms.ToString()));
            }
        }

        [Test]
        public async Task UpdateAsync_SetSite()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                UserEntity initialEntity = await env.Service.GetEntityAsync(User01Id);
                CollectionAssert.IsEmpty(initialEntity.Sites);

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("site"), new Site { CurrentProjectId = "project01" } }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User01Id,
                    Site = new Site { CurrentProjectId = "project01" }
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Site, Is.Not.Null);
                Assert.That(updatedResource.Site.CurrentProjectId, Is.EqualTo("project01"));

                UserEntity updatedEntity = await env.Service.GetEntityAsync(resource.Id);
                Assert.That(updatedEntity.Sites.Count, Is.EqualTo(1));
                Assert.That(updatedEntity.Sites[TestEnvironment.SiteAuthority].CurrentProjectId,
                    Is.EqualTo("project01"));
            }
        }

        [Test]
        public async Task UpdateAsync_UnsetSite()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                UserEntity initialEntity = await env.Service.GetEntityAsync(User02Id);
                Assert.That(initialEntity.Sites.Count, Is.EqualTo(1));
                Assert.That(initialEntity.Sites[TestEnvironment.SiteAuthority].CurrentProjectId,
                    Is.EqualTo("project01"));

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("site"), null }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = User02Id
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Site, Is.Null);

                UserEntity updatedEntity = await env.Service.GetEntityAsync(resource.Id);
                Assert.That(updatedEntity.Sites.Count, Is.EqualTo(0));
            }
        }

        [Test]
        public async Task UpdateAsync_UnlinkParatextAccount()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(ParatextUserId, SystemRoles.User);
                UserEntity initialEntity = await env.Service.GetEntityAsync(ParatextUserId);
                Assert.That(initialEntity.ParatextId, Is.Not.Empty);
                Assert.That(initialEntity.ParatextTokens, Is.Not.Null);


                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("paratext-id"), null }
                });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = ParatextUserId,
                    ParatextId = null,
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);
                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.ParatextId, Is.Null);
                // Unsetting the paratext-id should also unset paratext tokens
                UserEntity paratextUser = await env.Service.GetEntityAsync(ParatextUserId);
                Assert.That(paratextUser.ParatextTokens, Is.Null);
            }
        }

        [Test]
        public async Task GetAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.User);
                env.JsonApiContext.QuerySet.Returns(new QuerySet());
                env.JsonApiContext.PageManager.Returns(new PageManager());

                UserResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { User01Id }));
            }
        }

        [Test]
        public async Task GetAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.SystemAdmin);
                env.JsonApiContext.QuerySet.Returns(new QuerySet());
                env.JsonApiContext.PageManager.Returns(new PageManager());

                UserResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[]
                    {
                        User01Id,
                        User02Id,
                        "user03",
                        ParatextUserId
                    }));
            }
        }

        [Test]
        public async Task SaveAvatarAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.CreateSharedDir();
                env.SetUser(User01Id, SystemRoles.User);

                Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    using (var inputStream = new MemoryStream())
                        await env.Service.SaveAvatarAsync(User02Id, "file.png", inputStream);
                });

                Uri uri;
                using (var inputStream = new MemoryStream())
                    uri = await env.Service.SaveAvatarAsync(User01Id, "file.png", inputStream);

                Assert.That(uri.AbsolutePath, Is.EqualTo("/assets/avatars/user01.png"));
                Assert.That(string.IsNullOrEmpty(uri.Query), Is.False);
                Assert.That(File.Exists(Path.Combine(TestEnvironment.SharedDir, "avatars", "user01.png")), Is.True);
                UserEntity user = await env.Entities.GetAsync(User01Id);
                Assert.That(user.AvatarUrl, Is.EqualTo(uri.PathAndQuery));
            }
        }

        [Test]
        public async Task SaveAvatarAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.CreateSharedDir();
                env.SetUser(User01Id, SystemRoles.SystemAdmin);

                Uri uri;
                using (var inputStream = new MemoryStream())
                    uri = await env.Service.SaveAvatarAsync(User02Id, "file.png", inputStream);

                Assert.That(uri.AbsolutePath, Is.EqualTo("/assets/avatars/user02.png"));
                Assert.That(string.IsNullOrEmpty(uri.Query), Is.False);
                Assert.That(File.Exists(Path.Combine(TestEnvironment.SharedDir, "avatars", "user02.png")), Is.True);
                UserEntity user = await env.Entities.GetAsync(User02Id);
                Assert.That(user.AvatarUrl, Is.EqualTo(uri.PathAndQuery));

                using (var inputStream = new MemoryStream())
                    uri = await env.Service.SaveAvatarAsync(User01Id, "file.png", inputStream);

                Assert.That(uri.AbsolutePath, Is.EqualTo("/assets/avatars/user01.png"));
                Assert.That(string.IsNullOrEmpty(uri.Query), Is.False);
                Assert.That(File.Exists(Path.Combine(TestEnvironment.SharedDir, "avatars", "user01.png")), Is.True);
                user = await env.Entities.GetAsync(User01Id);
                Assert.That(user.AvatarUrl, Is.EqualTo(uri.PathAndQuery));
            }
        }

        [Test]
        public void UpdateRelationshipsAsync_ProjectsNotAllowed()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.User);

                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                    {
                        await env.Service.UpdateRelationshipsAsync(User01Id, "projects",
                            new List<ResourceObject> { new ResourceObject { Type = "projects", Id = "projectuser02" } });
                    });

                Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status405MethodNotAllowed));
            }
        }

        [Test]
        public async Task GetRelationshipsAsync_Projects()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser(User01Id, SystemRoles.User);

                object resources = await env.Service.GetRelationshipsAsync(User01Id, "projects");

                Assert.That(resources, Is.Not.Null);
                var projectResources = (IEnumerable<IResource>)resources;
                Assert.That(projectResources.Select(p => p.Id), Is.EqualTo(new[] { "projectuser01", "projectuser02" }));
            }
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
                            Users =
                            {
                                new TestProjectUserEntity
                                {
                                    Id = "projectuser01",
                                    UserRef = User01Id,
                                    Role = TestProjectRoles.Manager
                                }
                            }
                        },
                        new TestProjectEntity
                        {
                            Id = "project02",
                            Users =
                            {
                                new TestProjectUserEntity
                                {
                                    Id = "projectuser02",
                                    UserRef = User01Id,
                                    Role = TestProjectRoles.Manager
                                }
                            }
                        }
                    });

                Service = new UserService(JsonApiContext, Mapper, UserAccessor, Entities, SiteOptions)
                {
                    ProjectUserMapper = new TestProjectUserService(JsonApiContext, Mapper, UserAccessor, projects)
                };
            }

            public UserService Service { get; }

            protected override IEnumerable<Func<UserEntity, object>> GetUniqueKeySelectors()
            {
                return new Func<UserEntity, object>[]
                {
                    entity => entity.CanonicalEmail
                };
            }

            protected override IEnumerable<UserEntity> GetInitialData()
            {
                return new[]
                {
                    new UserEntity
                    {
                        Id = User01Id,
                        Username = User01Id,
                        Email = User01Email,
                        CanonicalEmail = User01Email
                    },
                    new UserEntity
                    {
                        Id = User02Id,
                        Username = User02Id,
                        Email = "user02@example.com",
                        CanonicalEmail = "user02@example.com",
                        Sites = new Dictionary<string, Site>
                        {
                            { SiteAuthority, new Site { CurrentProjectId = "project01" } }
                        }
                    },
                    new UserEntity
                    {
                        Id = "user03",
                        Username = "user03",
                        Email = "user03@example.com",
                        CanonicalEmail = "user03@example.com"
                    },
                    new UserEntity
                    {
                        Id = ParatextUserId,
                        Username = ParatextUserId,
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

            protected override void SetupMapper(IMapperConfigurationExpression config)
            {
                config.CreateMap<TestProjectUserEntity, TestProjectUserResource>()
                    .ReverseMap();
            }
        }
    }
}
