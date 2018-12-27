using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Services;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class TestUserService : UserService<TestUserResource>
    {
        public TestUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<UserEntity> users, IOptions<SiteOptions> options)
            : base(jsonApiContext, mapper, userAccessor, users, options)
        {
        }

        public async Task<UserEntity> GetEntityAsync(string id)
        {
            return await Entities.GetAsync(id);
        }
    }
}
