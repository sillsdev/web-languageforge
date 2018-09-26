using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestProjectDataService
        : ProjectDataServiceBase<TestProjectDataResource, TestProjectDataEntity, TestProjectEntity>
    {
        public TestProjectDataService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<TestProjectDataEntity> entities, IRepository<TestProjectEntity> projects)
            : base(jsonApiContext, mapper, userAccessor, entities, projects)
        {
        }

        protected override Domain Domain => Domain.Entries;

        protected override async Task<IEnumerable<TestProjectEntity>> GetProjectsAsync()
        {
            return await Projects.Query().Where(p => p.Users.Any(u => u.UserRef == UserId)).ToListAsync();
        }
    }
}
