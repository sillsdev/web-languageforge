using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestProjectService : ProjectService<TestProjectResource, TestProjectEntity>
    {
        public TestProjectService(IJsonApiContext jsonApiContext, IRepository<TestProjectEntity> entities,
            IMapper mapper, IUserAccessor userAccessor) : base(jsonApiContext, entities, mapper, userAccessor)
        {
        }
    }
}
