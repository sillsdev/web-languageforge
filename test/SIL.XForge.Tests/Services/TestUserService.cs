using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestUserService : UserService<TestProjectResource, TestProjectEntity>
    {
        public TestUserService(IJsonApiContext jsonApiContext, IRepository<UserEntity> entities, IMapper mapper,
            IUserAccessor userAccessor) : base(jsonApiContext, entities, mapper, userAccessor)
        {
        }
    }
}
