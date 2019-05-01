using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestProjectUserService
        : ProjectUserService<TestProjectUserResource, TestProjectUserEntity, TestProjectEntity>
    {
        public TestProjectUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TestProjectEntity> projects) : base(jsonApiContext, mapper, userAccessor, projects)
        {
        }
    }
}
