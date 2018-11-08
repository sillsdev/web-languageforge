using System.Collections.Generic;
using System.Security;
using System.Threading.Tasks;
using IdentityServer4.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Scripture.Services;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Controllers
{
    [Route("paratext-api/projects")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ParatextProjectsController : ControllerBase
    {
        private readonly IRepository<UserEntity> _users;
        private readonly IParatextService _paratextService;
        private readonly IUserAccessor _userAccessor;

        public ParatextProjectsController(IRepository<UserEntity> users, IParatextService paratextService,
            IUserAccessor userAccessor)
        {
            _users = users;
            _paratextService = paratextService;
            _userAccessor = userAccessor;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ParatextProject>>> GetAsync()
        {
            UserEntity user = await _users.GetAsync(_userAccessor.UserId);
            if (user.ParatextTokens == null)
                return NoContent();

            try
            {
                IReadOnlyList<ParatextProject> projects = await _paratextService.GetProjectsAsync(user);
                return Ok(projects);
            }
            catch (SecurityException)
            {
                return NoContent();
            }
        }
    }
}
