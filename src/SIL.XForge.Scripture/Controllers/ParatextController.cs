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
    [Route("paratext-api")]
    [ApiController]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ParatextController : ControllerBase
    {
        private readonly IRepository<UserEntity> _users;
        private readonly IParatextService _paratextService;
        private readonly IUserAccessor _userAccessor;

        public ParatextController(IRepository<UserEntity> users, IParatextService paratextService,
            IUserAccessor userAccessor)
        {
            _users = users;
            _paratextService = paratextService;
            _userAccessor = userAccessor;
        }

        [HttpGet("projects")]
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

        [HttpGet("username")]
        public async Task<ActionResult<string>> UsernameAsync()
        {
            UserEntity user = await _users.GetAsync(_userAccessor.UserId);
            if (user.ParatextTokens == null)
                return NoContent();
            string username = _paratextService.GetParatextUsername(user);
            return Ok(username);
        }
    }
}
