using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
    public class ResourceServiceBaseTests
    {
        [Test]
        public async Task CreateAsync()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("testnew"), Is.False);

                var resource = new TestResource
                {
                    Id = "testnew",
                    Str = "new",
                    User = new UserResource { Id = "user01" },
                    UserRef = "user01"
                };
                TestResource newResource = await env.Service.CreateAsync(resource);

                Assert.That(newResource, Is.Not.Null);
                Assert.That(newResource.Id, Is.EqualTo("testnew"));
                Assert.That(newResource.Str, Is.EqualTo("new"));
                Assert.That(newResource.UserRef, Is.EqualTo("user01"));
                Assert.That(env.Entities.Contains("testnew"), Is.True);
            }
        }

        [Test]
        public async Task UpdateAsync_Found()
        {
            using (var env = new TestEnvironment())
            {
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("str"), "new" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>
                    {
                        { env.GetRelationship("user"), "user01" }
                    });

                TestEntity entity = await env.Entities.GetAsync("test01");
                Assert.That(entity.Str, Is.EqualTo("old"));
                Assert.That(entity.UserRef, Is.Null);

                var resource = new TestResource
                {
                    Id = "test01",
                    Str = "new",
                    User = new UserResource { Id = "user01" },
                    UserRef = "user01"
                };
                TestResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Str, Is.EqualTo("new"));
                Assert.That(updatedResource.UserRef, Is.EqualTo("user01"));
                Assert.That(env.Entities.Contains("test01"), Is.True);
            }
        }

        [Test]
        public async Task UpdateAsync_RemoveAttribute()
        {
            using (var env = new TestEnvironment())
            {
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("num"), null }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>());

                TestEntity entity = await env.Entities.GetAsync("test02");
                Assert.That(entity.Num, Is.EqualTo(1));

                var resource = new TestResource
                {
                    Id = "test02"
                };
                TestResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.Num, Is.EqualTo(default(int)));
                Assert.That(env.Entities.Contains("test02"), Is.True);
            }
        }

        [Test]
        public async Task UpdateAsync_RemoveRelationship()
        {
            using (var env = new TestEnvironment())
            {
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>());
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>
                    {
                        { env.GetRelationship("user"), null }
                    });

                TestEntity entity = await env.Entities.GetAsync("test02");
                Assert.That(entity.UserRef, Is.EqualTo("user01"));

                var resource = new TestResource
                {
                    Id = "test02"
                };
                TestResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Not.Null);
                Assert.That(updatedResource.UserRef, Is.Null);
                Assert.That(env.Entities.Contains("test02"), Is.True);
            }
        }

        [Test]
        public async Task UpdateAsync_NotFound()
        {
            using (var env = new TestEnvironment())
            {
                env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                    {
                        { env.GetAttribute("str"), "new" }
                    });
                env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>
                    {
                        { env.GetRelationship("user"), "user01" }
                    });

                Assert.That(env.Entities.Contains("testbad"), Is.False);

                var resource = new TestResource
                {
                    Id = "testbad",
                    Str = "new",
                    User = new UserResource { Id = "user01" },
                    UserRef = "user01"
                };
                TestResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

                Assert.That(updatedResource, Is.Null);
            }
        }

        [Test]
        public async Task UpdateRelationshipsAsync_Found()
        {
            using (var env = new TestEnvironment())
            {
                TestEntity entity = await env.Entities.GetAsync("test01");
                Assert.That(entity.UserRef, Is.Null);

                await env.Service.UpdateRelationshipsAsync("test01", "user",
                    new List<ResourceObject> { new ResourceObject { Type = "users", Id = "user01" } });

                TestEntity updatedEntity = await env.Entities.GetAsync("test01");
                Assert.That(updatedEntity.UserRef, Is.EqualTo("user01"));
            }
        }

        [Test]
        public void UpdateRelationshipsAsync_NotFound()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("testbad"), Is.False);

                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                    {
                        await env.Service.UpdateRelationshipsAsync("testbad", "user",
                            new List<ResourceObject> { new ResourceObject { Type = "users", Id = "user01" } });
                    });

                Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status404NotFound));
            }
        }

        [Test]
        public void UpdateRelationshipsAsync_InvalidRelationship()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("test01"), Is.True);

                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                    {
                        await env.Service.UpdateRelationshipsAsync("test01", "badrelationship",
                            new List<ResourceObject> { new ResourceObject { Type = "bad", Id = "badid" } });
                    });

                Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status404NotFound));
            }
        }

        [Test]
        public async Task DeleteAsync_Found()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("test01"), Is.True);

                Assert.That(await env.Service.DeleteAsync("test01"), Is.True);

                Assert.That(env.Entities.Contains("test01"), Is.False);
            }
        }

        [Test]
        public async Task DeleteAsync_NotFound()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("testbad"), Is.False);

                Assert.That(await env.Service.DeleteAsync("testbad"), Is.False);
            }
        }

        [Test]
        public async Task GetAsync_WithIdFound()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("test01"), Is.True);

                TestResource resource = await env.Service.GetAsync("test01");

                Assert.That(resource, Is.Not.Null);
                Assert.That(resource.Id, Is.EqualTo("test01"));
                Assert.That(resource.Str, Is.EqualTo("old"));
            }
        }

        [Test]
        public void GetAsync_WithIdNotFound()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("testbad"), Is.False);

                Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.GetAsync("testbad");
                });
            }
        }

        [Test]
        public async Task GetAsync_FilterSortPage()
        {
            using (var env = new TestEnvironment())
            {
                env.JsonApiContext.QuerySet.Returns(new QuerySet
                {
                    Filters = { new FilterQuery("str", "string1", "eq") },
                    SortParameters = { new SortQuery(SortDirection.Descending, "num") }
                });
                var pageManager = new PageManager { PageSize = 5, CurrentPage = 2 };
                env.JsonApiContext.PageManager.Returns(pageManager);

                TestResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Select(r => r.Id), Is.EqualTo(new[]
                    {
                        "test05", "test04", "test03", "test02"
                    }));
                Assert.That(resources[3].UserRef, Is.EqualTo("user01"));
                Assert.That(resources[3].User, Is.Null);
                Assert.That(pageManager.TotalRecords, Is.EqualTo(9));
            }
        }

        [Test]
        public async Task GetAsync_Include()
        {
            using (var env = new TestEnvironment())
            {
                env.JsonApiContext.QuerySet.Returns(new QuerySet
                {
                    SortParameters = { new SortQuery(SortDirection.Ascending, "num") },
                    IncludedRelationships = { "user" }
                });
                env.JsonApiContext.PageManager.Returns(new PageManager());

                TestResource[] resources = (await env.Service.GetAsync()).ToArray();

                Assert.That(resources.Length, Is.EqualTo(10));
                Assert.That(resources[1].User.Id, Is.EqualTo("user01"));
                Assert.That(resources[7].User.Id, Is.EqualTo("user01"));
            }
        }

        [Test]
        public async Task GetRelationshipAsync_Found()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("test02"), Is.True);

                object resource = await env.Service.GetRelationshipAsync("test02", "user");

                Assert.That(resource, Is.Not.Null);
                var userResource = (UserResource)resource;
                Assert.That(userResource.Id, Is.EqualTo("user01"));
            }
        }

        [Test]
        public void GetRelationshipAsync_NotFound()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("testbad"), Is.False);

                Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.GetRelationshipAsync("testbad", "user");
                });
            }
        }

        [Test]
        public void GetRelationshipAsync_InvalidRelationship()
        {
            using (var env = new TestEnvironment())
            {
                Assert.That(env.Entities.Contains("test01"), Is.True);

                var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.GetRelationshipAsync("test01", "badrelationship");
                });

                Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status404NotFound));
            }
        }

        class TestEnvironment : ResourceServiceTestEnvironmentBase<TestResource, TestEntity>
        {
            public TestEnvironment()
                : base("tests")
            {
                var users = new MemoryRepository<UserEntity>(new[] { new UserEntity { Id = "user01" } });

                Service = new TestService(JsonApiContext, Mapper, UserAccessor, Entities)
                {
                    UserMapper = new UserService(JsonApiContext, Mapper, UserAccessor, users, SiteOptions)
                };
            }

            public TestService Service { get; }

            protected override IEnumerable<TestEntity> GetInitialData()
            {
                return new[]
                {
                    new TestEntity { Id = "test01", Str = "old", Num = 0 },
                    new TestEntity { Id = "test02", Str = "string1", Num = 1, UserRef = "user01" },
                    new TestEntity { Id = "test03", Str = "string1", Num = 2 },
                    new TestEntity { Id = "test04", Str = "string1", Num = 3 },
                    new TestEntity { Id = "test05", Str = "string1", Num = 4 },
                    new TestEntity { Id = "test06", Str = "string1", Num = 5 },
                    new TestEntity { Id = "test07", Str = "string1", Num = 6 },
                    new TestEntity { Id = "test08", Str = "string1", Num = 7, UserRef = "user01" },
                    new TestEntity { Id = "test09", Str = "string1", Num = 8 },
                    new TestEntity { Id = "test10", Str = "string1", Num = 9 }
                };
            }

            protected override void SetupResourceGraph(IResourceGraphBuilder builder)
            {
                builder.AddResource<UserResource, string>("users");
            }
        }
    }
}
