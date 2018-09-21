using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
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
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("testnew"), Is.False);

            var resource = new TestResource
            {
                Id = "testnew",
                Str = "new",
                User = new UserResource { Id = "user1" },
                UserRef = "user1"
            };
            TestResource updatedResource = await env.Service.CreateAsync(resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Id, Is.EqualTo("testnew"));
            Assert.That(updatedResource.Str, Is.EqualTo("new"));
            Assert.That(updatedResource.UserRef, Is.EqualTo("user1"));
            Assert.That(env.Repository.Entities.ContainsKey("testnew"), Is.True);
        }

        [Test]
        public async Task UpdateAsync_Found()
        {
            var env = new TestEnvironment();
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("str"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>
                {
                    { env.GetRelationship("user"), "user1" }
                });

            TestEntity entity = await env.Repository.GetAsync("test01");
            Assert.That(entity.Str, Is.EqualTo("old"));
            Assert.That(entity.UserRef, Is.Null);

            var resource = new TestResource
            {
                Id = "test01",
                Str = "new",
                User = new UserResource { Id = "user1" },
                UserRef = "user1"
            };
            TestResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Not.Null);
            Assert.That(updatedResource.Str, Is.EqualTo("new"));
            Assert.That(updatedResource.UserRef, Is.EqualTo("user1"));
            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.True);
        }

        [Test]
        public async Task UpdateAsync_NotFound()
        {
            var env = new TestEnvironment();
            env.JsonApiContext.AttributesToUpdate.Returns(new Dictionary<AttrAttribute, object>
                {
                    { env.GetAttribute("str"), "new" }
                });
            env.JsonApiContext.RelationshipsToUpdate.Returns(new Dictionary<RelationshipAttribute, object>
                {
                    { env.GetRelationship("user"), "user1" }
                });

            Assert.That(env.Repository.Entities.ContainsKey("testbad"), Is.False);

            var resource = new TestResource
            {
                Id = "testbad",
                Str = "new",
                User = new UserResource { Id = "user1" },
                UserRef = "user1"
            };
            TestResource updatedResource = await env.Service.UpdateAsync(resource.Id, resource);

            Assert.That(updatedResource, Is.Null);
        }

        [Test]
        public async Task UpdateRelationshipsAsync_Found()
        {
            var env = new TestEnvironment();

            TestEntity entity = await env.Repository.GetAsync("test01");
            Assert.That(entity.UserRef, Is.Null);

            await env.Service.UpdateRelationshipsAsync("test01", TestResource.UserRelationship,
                new List<DocumentData> { new DocumentData { Type = "users", Id = "user1" } });

            TestEntity updatedEntity = await env.Repository.GetAsync("test01");
            Assert.That(updatedEntity.UserRef, Is.EqualTo("user1"));
        }

        [Test]
        public void UpdateRelationshipsAsync_NotFound()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("testbad"), Is.False);

            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.UpdateRelationshipsAsync("testbad", TestResource.UserRelationship,
                        new List<DocumentData> { new DocumentData { Type = "users", Id = "user1" } });
                });
            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status404NotFound));
        }

        [Test]
        public void UpdateRelationshipsAsync_InvalidRelationship()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.True);

            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.UpdateRelationshipsAsync("test01", "badrelationship",
                        new List<DocumentData> { new DocumentData { Type = "bad", Id = "badid" } });
                });
            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status400BadRequest));
        }

        [Test]
        public async Task DeleteAsync_Found()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.True);

            Assert.That(await env.Service.DeleteAsync("test01"), Is.True);

            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.False);
        }

        [Test]
        public async Task DeleteAsync_NotFound()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("testbad"), Is.False);

            Assert.That(await env.Service.DeleteAsync("testbad"), Is.False);
        }

        [Test]
        public async Task GetAsync_WithIdFound()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.True);

            TestResource resource = await env.Service.GetAsync("test01");

            Assert.That(resource, Is.Not.Null);
            Assert.That(resource.Id, Is.EqualTo("test01"));
            Assert.That(resource.Str, Is.EqualTo("old"));
        }

        [Test]
        public async Task GetAsync_WithIdNotFound()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("testbad"), Is.False);

            TestResource resource = await env.Service.GetAsync("testbad");

            Assert.That(resource, Is.Null);
        }

        [Test]
        public async Task GetAsync_FilterSortPage()
        {
            var env = new TestEnvironment();
            env.JsonApiContext.QuerySet.Returns(new QuerySet
                {
                    Filters = { new FilterQuery("str", "string1", "eq") },
                    SortParameters = { new SortQuery(SortDirection.Descending, env.GetAttribute("num")) }
                });
            var pageManager = new PageManager { PageSize = 5, CurrentPage = 2 };
            env.JsonApiContext.PageManager.Returns(pageManager);

            TestResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Select(r => r.Id), Is.EqualTo(new[]
                {
                    "test05", "test04", "test03", "test02"
                }));
            Assert.That(resources[3].UserRef, Is.EqualTo("user1"));
            Assert.That(resources[3].User, Is.Null);
            Assert.That(pageManager.TotalRecords, Is.EqualTo(9));
        }

        [Test]
        public async Task GetAsync_Include()
        {
            var env = new TestEnvironment();
            env.JsonApiContext.QuerySet.Returns(new QuerySet
                {
                    SortParameters = { new SortQuery(SortDirection.Ascending, env.GetAttribute("num")) },
                    IncludedRelationships = { TestResource.UserRelationship }
                });
            env.JsonApiContext.PageManager.Returns(new PageManager());

            TestResource[] resources = (await env.Service.GetAsync()).ToArray();

            Assert.That(resources.Length, Is.EqualTo(10));
            Assert.That(resources[1].User.Id, Is.EqualTo("user1"));
            Assert.That(resources[7].User.Id, Is.EqualTo("user1"));
        }

        [Test]
        public async Task GetRelationshipAsync_Found()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.True);

            object resource = await env.Service.GetRelationshipAsync("test01", TestResource.UserRelationship);

            Assert.That(resource, Is.Not.Null);
            var userResource = (UserResource) resource;
            Assert.That(userResource.Id, Is.EqualTo("user1"));
        }

        [Test]
        public async Task GetRelationshipAsync_NotFound()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("testbad"), Is.False);

            object resource = await env.Service.GetRelationshipAsync("testbad", TestResource.UserRelationship);

            Assert.That(resource, Is.Null);
        }

        [Test]
        public void GetRelationshipAsync_InvalidRelationship()
        {
            var env = new TestEnvironment();

            Assert.That(env.Repository.Entities.ContainsKey("test01"), Is.True);

            var ex = Assert.ThrowsAsync<JsonApiException>(async () =>
                {
                    await env.Service.GetRelationshipAsync("test01", "badrelationship");
                });
            Assert.That(ex.GetStatusCode(), Is.EqualTo(StatusCodes.Status400BadRequest));
        }

        class TestEnvironment
        {
            public TestEnvironment()
            {
                var contextGraphBuilder = new ContextGraphBuilder();
                contextGraphBuilder.AddResource<TestResource, string>("tests");
                contextGraphBuilder.AddResource<UserResource, string>("users");
                ContextGraph = contextGraphBuilder.Build();

                JsonApiContext = Substitute.For<IJsonApiContext>();
                JsonApiContext.ContextGraph.Returns(ContextGraph);
                JsonApiContext.RequestEntity.Returns(ContextGraph.GetContextEntity("tests"));
                JsonApiContext.Options.Returns(new JsonApiOptions { IncludeTotalRecordCount = true });

                Repository = new MemoryRepository<TestEntity>(new[]
                    {
                        new TestEntity { Id = "test01", Str = "old", Num = 0 },
                        new TestEntity { Id = "test02", Str = "string1", Num = 1, UserRef = "user1" },
                        new TestEntity { Id = "test03", Str = "string1", Num = 2 },
                        new TestEntity { Id = "test04", Str = "string1", Num = 3 },
                        new TestEntity { Id = "test05", Str = "string1", Num = 4 },
                        new TestEntity { Id = "test06", Str = "string1", Num = 5 },
                        new TestEntity { Id = "test07", Str = "string1", Num = 6 },
                        new TestEntity { Id = "test08", Str = "string1", Num = 7, UserRef = "user1" },
                        new TestEntity { Id = "test09", Str = "string1", Num = 8 },
                        new TestEntity { Id = "test10", Str = "string1", Num = 9 }
                    });

                var config = new MapperConfiguration(cfg =>
                    {
                        cfg.CreateMissingTypeMaps = true;
                        cfg.CreateMap<TestEntity, TestResource>()
                            .ForMember(e => e.User, o => o.Ignore())
                            .ReverseMap();
                    });
                var userAccessor = Substitute.For<IUserAccessor>();
                var userResourceMapper = Substitute.For<IResourceMapper<UserResource, UserEntity>>();

                IEnumerable<UserResource> userResources = new[] { new UserResource { Id = "user1" } };
                userResourceMapper.MapMatchingAsync(null, null, null).ReturnsForAnyArgs(Task.FromResult(userResources));
                Service = new TestService(JsonApiContext, Repository, config.CreateMapper(), userAccessor)
                {
                    UserResourceMapper = userResourceMapper
                };
            }

            public IContextGraph ContextGraph { get; }
            public IJsonApiContext JsonApiContext { get; }
            public MemoryRepository<TestEntity> Repository { get; }
            public TestService Service { get; }

            public AttrAttribute GetAttribute(string name)
            {
                ContextEntity resourceType = ContextGraph.GetContextEntity("tests");
                return resourceType.Attributes.First(a => a.PublicAttributeName == name);
            }

            public RelationshipAttribute GetRelationship(string name)
            {
                ContextEntity resourceType = ContextGraph.GetContextEntity("tests");
                return resourceType.Relationships.First(r => r.PublicRelationshipName == name);
            }
        }
    }
}
