using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Services
{
    public class SFProjectUserService : ProjectUserService<SFProjectUserResource, SFProjectUserEntity, SFProjectEntity>
    {
        private readonly IRepository<UserEntity> _users;
        private readonly IParatextService _paratextService;

        public SFProjectUserService(IJsonApiContext jsonApiContext, IMapper mapper, IUserAccessor userAccessor,
            IRepository<SFProjectEntity> projects, IRepository<UserEntity> users, IParatextService paratextService)
            : base(jsonApiContext, mapper, userAccessor, projects)
        {
            _users = users;
            _paratextService = paratextService;
        }

        protected override async Task<SFProjectUserEntity> InsertEntityAsync(SFProjectUserEntity entity)
        {
            UserEntity user = await _users.GetAsync(UserId);
            if (user.Role == SystemRoles.User || entity.Role == null)
            {
                // get role from Paratext project
                string paratextId = await Projects.Query().Where(p => p.Id == entity.ProjectRef)
                    .Select(p => p.ParatextId).SingleOrDefaultAsync();
                if (paratextId == null)
                {
                    throw new JsonApiException(StatusCodes.Status400BadRequest,
                        "The specified project could not be found.");
                }
                entity.Role = await _paratextService.GetProjectRoleAsync(user, paratextId);
            }

            return await base.InsertEntityAsync(entity);
        }
    }
}
