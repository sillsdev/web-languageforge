using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestService : RepositoryResourceServiceBase<TestResource, TestEntity>
    {
        public TestService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TestEntity> entities) : base(jsonApiContext, mapper, userAccessor, entities)
        {
        }

        public IResourceMapper<UserResource, UserEntity> UserMapper { get; set; }

        protected override IRelationship<TestEntity> GetRelationship(string propertyName)
        {
            switch (propertyName)
            {
                case nameof(TestResource.User):
                    return ManyToOne(UserMapper, e => e.UserRef);
            }
            return base.GetRelationship(propertyName);
        }

        protected override Task CheckCanCreateAsync(TestResource resource)
        {
            return Task.CompletedTask;
        }

        protected override Task CheckCanUpdateAsync(string id, IDictionary<string, object> attrs,
            IDictionary<string, string> relationships)
        {
            return Task.CompletedTask;
        }

        protected override Task CheckCanUpdateRelationshipAsync(string id)
        {
            return Task.CompletedTask;
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return Task.CompletedTask;
        }

        protected override Task<IQueryable<TestEntity>> ApplyPermissionFilterAsync(IQueryable<TestEntity> query)
        {
            return Task.FromResult(query);
        }
    }
}
