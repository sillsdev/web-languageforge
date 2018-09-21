using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestProjectDataService
        : ProjectDataServiceBase<TestProjectDataResource, TestProjectDataEntity, TestProjectResource, TestProjectEntity>
    {
        public TestProjectDataService(IJsonApiContext jsonApiContext, IRepository<TestProjectEntity> projects,
            IRepository<TestProjectDataEntity> entities, IMapper mapper, IUserAccessor userAccessor)
            : base(jsonApiContext, projects, entities, mapper, userAccessor)
        {
        }

        protected override Domain Domain => Domain.Entries;
    }
}
