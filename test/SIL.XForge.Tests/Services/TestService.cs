using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestService : ResourceServiceBase<TestResource, TestEntity>
    {
        public TestService(IJsonApiContext jsonApiContext, IRepository<TestEntity> entities, IMapper mapper,
            IUserAccessor userAccessor) : base(jsonApiContext, entities, mapper, userAccessor)
        {
        }

        public IResourceMapper<UserResource, UserEntity> UserResourceMapper { get; set; }

        protected override void SetNewEntityRelationships(TestEntity entity, TestResource resource)
        {
            if (resource.User != null)
                entity.UserRef = resource.User.Id;
        }

        protected override IRelationship<TestEntity> GetRelationship(string relationshipName)
        {
            switch (relationshipName)
            {
                case TestResource.UserRelationship:
                    return ManyToOne(UserResourceMapper, e => e.UserRef);
            }
            return base.GetRelationship(relationshipName);
        }

        protected override Task CheckCanCreateAsync(TestResource resource)
        {
            return Task.CompletedTask;
        }

        protected override Task CheckCanDeleteAsync(string id)
        {
            return Task.CompletedTask;
        }

        protected override Task CheckCanUpdateAsync(string id)
        {
            return Task.CompletedTask;
        }

        protected override Task<Expression<Func<TestEntity, bool>>> GetRightFilterAsync()
        {
            return Task.FromResult<Expression<Func<TestEntity, bool>>>((TestEntity e) => true);
        }
    }
}
