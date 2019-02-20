using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestProjectDataService
        : ProjectDataService<TestProjectDataResource, TestProjectDataEntity, TestProjectEntity>
    {
        public TestProjectDataService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TestProjectDataEntity> entities, IRepository<TestProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor, entities, projects)
        {
        }

        protected override Domain Domain => Domain.Entries;
    }
}
