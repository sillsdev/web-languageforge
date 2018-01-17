using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("[controller]")]
    public class UsersController : ResourceController
    {
        private readonly IRepository<User> _userRepo;
        private readonly ParatextService _paratextService;

        public UsersController(IMapper mapper, IRepository<User> userRepo, ParatextService paratextService)
            : base(mapper)
        {
            _userRepo = userRepo;
            _paratextService = paratextService;
        }

        [HttpGet("{userId}/paratext")]
        [SiteAuthorize(Domain.Users, Operation.ViewOwn)]
        public async Task<IActionResult> GetParatextInfoAsync(string userId)
        {
            if (!(await _userRepo.TryGetAsync(GetActualUserId(userId))).TryResult(out User user))
                return NotFound();

            if ((await _paratextService.TryGetUserInfoAsync(user)).TryResult(out ParatextUserInfo userInfo))
                return Ok(Map<ParatextUserInfoDto>(userInfo));
            return NoContent();
        }

        [HttpGet("{userId}/projects")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProjectsAsync(string userId)
        {
            if (!(await _userRepo.TryGetAsync(GetActualUserId(userId))).TryResult(out User user))
                return NotFound();

            return Ok(user.Projects.Select(p => Map(p, RouteNames.Lexicon)));
        }

        private string GetActualUserId(string userId)
        {
            if (userId == "me" || userId == "my")
                return UserId;
            return userId;
        }
    }
}
