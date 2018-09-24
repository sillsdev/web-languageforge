using System.Linq;
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

        protected override IRelationship<TestEntity> GetRelationship(string propertyName)
        {
            switch (propertyName)
            {
                case nameof(TestResource.User):
                    return ManyToOne(UserResourceMapper, e => e.UserRef);
            }
            return base.GetRelationship(propertyName);
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

        protected override Task<IQueryable<TestEntity>> ApplyPermissionFilterAsync(IQueryable<TestEntity> query)
        {
            return Task.FromResult(query);
        }
    }
}
