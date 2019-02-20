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
        [Test]
        public void CreateAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
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
        }

        [Test]
        public async Task CreateAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.SystemAdmin);

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
                env.SetUser("user01", SystemRoles.SystemAdmin);

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
                env.SetUser("user01", SystemRoles.SystemAdmin);

                var userResource = new UserResource
                {
                    Id = "usernew",
                    Email = "UserNew@gmail.com"
                };
                UserResource newResource = await env.Service.CreateAsync(userResource);

                Assert.That(newResource, Is.Not.Null);
                Assert.That(newResource.Email, Is.EqualTo("UserNew@gmail.com"));
                Assert.That(newResource.CanonicalEmail, Is.EqualTo("usernew@gmail.com"));
            }
        }

        [Test]
        public async Task UpdateAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
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
        }

        [Test]
        public async Task UpdateAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
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
        }

        [Test]
        public async Task UpdateAsync_CaseInsensitiveUsername()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("username"), "USER_01" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = "user01",
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
                env.SetUser("user01", SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("email"), "New@gmail.com" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = "user01",
                    Email = "New@gmail.com"
                };
                UserResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Email, Is.EqualTo("New@gmail.com"));
                Assert.That(updatedResource.CanonicalEmail, Is.EqualTo("new@gmail.com"));
            }
        }

        [Test]
        public async Task UpdateAsync_SetSite()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("site"), new Site { CurrentProjectId = "project01" } }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = "user01",
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
                UserEntity initialEntity = await env.Service.GetEntityAsync("user02");
                Assert.That(initialEntity.Sites.Count, Is.EqualTo(1));
                Assert.That(initialEntity.Sites[TestEnvironment.SiteAuthority].CurrentProjectId,
                    Is.EqualTo("project01"));

                env.SetUser("user01", SystemRoles.SystemAdmin);
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("site"), null }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
                {
                    Id = "user02"
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
                env.SetUser("paratextuser01", SystemRoles.User);

                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("paratext-id"), null }
                });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                var resource = new UserResource
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
        }

        [Test]
        public async Task GetAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.User);
                env.JsonApiContext.QuerySet.Returns(new QuerySet());
                env.JsonApiContext.PageManager.Returns(new PageManager());

                UserResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[] { "user01" }));
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

                UserResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EquivalentTo(new[]
                    {
                        "user01",
                        "user02",
                        "user03",
                        "paratextuser01"
                    }));
            }
        }

        [Test]
        public async Task SaveAvatarAsync_UserRole()
        {
            using (var env = new TestEnvironment())
            {
                env.CreateSharedDir();
                env.SetUser("user01", SystemRoles.User);

                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    using (var inputStream = new MemoryStream())
                        await env.Service.SaveAvatarAsync("user02", "file.png", inputStream);
                });

                Uri uri;
                using (var inputStream = new MemoryStream())
                    uri = await env.Service.SaveAvatarAsync("user01", "file.png", inputStream);

                Assert.That(uri.AbsolutePath, Is.EqualTo("/assets/avatars/user01.png"));
                Assert.That(string.IsNullOrEmpty(uri.Query), Is.False);
                Assert.That(File.Exists(Path.Combine(TestEnvironment.SharedDir, "avatars", "user01.png")), Is.True);
                UserEntity user = await env.Entities.GetAsync("user01");
                Assert.That(user.AvatarUrl, Is.EqualTo(uri.PathAndQuery));
            }
        }

        [Test]
        public async Task SaveAvatarAsync_SystemAdminRole()
        {
            using (var env = new TestEnvironment())
            {
                env.CreateSharedDir();
                env.SetUser("user01", SystemRoles.SystemAdmin);

                Uri uri;
                using (var inputStream = new MemoryStream())
                    uri = await env.Service.SaveAvatarAsync("user02", "file.png", inputStream);

                Assert.That(uri.AbsolutePath, Is.EqualTo("/assets/avatars/user02.png"));
                Assert.That(string.IsNullOrEmpty(uri.Query), Is.False);
                Assert.That(File.Exists(Path.Combine(TestEnvironment.SharedDir, "avatars", "user02.png")), Is.True);
                UserEntity user = await env.Entities.GetAsync("user02");
                Assert.That(user.AvatarUrl, Is.EqualTo(uri.PathAndQuery));

                using (var inputStream = new MemoryStream())
                    uri = await env.Service.SaveAvatarAsync("user01", "file.png", inputStream);

                Assert.That(uri.AbsolutePath, Is.EqualTo("/assets/avatars/user01.png"));
                Assert.That(string.IsNullOrEmpty(uri.Query), Is.False);
                Assert.That(File.Exists(Path.Combine(TestEnvironment.SharedDir, "avatars", "user01.png")), Is.True);
                user = await env.Entities.GetAsync("user01");
                Assert.That(user.AvatarUrl, Is.EqualTo(uri.PathAndQuery));
            }
        }

        [Test]
        public void UpdateRelationshipsAsync_ProjectsNotAllowed()
        {
            using (var env = new TestEnvironment())
            {
                env.SetUser("user01", SystemRoles.User);

                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                    {
                        await env.Service.UpdateRelationshipsAsync("user01", "projects",
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
                env.SetUser("user01", SystemRoles.User);

                object resources = await env.Service.GetRelationshipsAsync("user01", "projects");

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
                                    UserRef = "user01",
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
                                    UserRef = "user01",
                                    Role = TestProjectRoles.Manager
                                }
                            }
                        }
                    });

                Service = new UserService(JsonApiContext, Mapper, UserAccessor, Entities, Options)
                {
                    ProjectUserMapper = new TestProjectUserService(JsonApiContext, Mapper, UserAccessor, projects)
                };
            }

            public UserService Service { get; }

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
                        CanonicalEmail = "user02@gmail.com",
                        Sites = new Dictionary<string, Site>
                        {
                            { SiteAuthority, new Site { CurrentProjectId = "project01" } }
                        }
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

            protected override void SetupMapper(IMapperConfigurationExpression config)
            {
                config.CreateMap<TestProjectUserEntity, TestProjectUserResource>()
                    .ReverseMap();
            }
        }
    }
}
