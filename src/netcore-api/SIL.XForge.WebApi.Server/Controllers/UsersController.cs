using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("[controller]")]
    public class UsersController : Controller
    {
        private readonly IRepository<User> _userRepo;
        private readonly ParatextService _paratextService;

        public UsersController(IRepository<User> userRepo, ParatextService paratextService)
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
                return Ok(CreateDto(userInfo));
            return NoContent();
        }

        private string GetActualUserId(string userId)
        {
            if (userId == "me" || userId == "my")
                return User.FindFirstValue(ClaimTypes.NameIdentifier);
            return userId;
        }

        private ParatextUserInfoDto CreateDto(ParatextUserInfo userInfo)
        {
            return new ParatextUserInfoDto
            {
                Username = userInfo.Username,
                Projects = userInfo.Projects.Select(CreateDto).ToArray()
            };
        }

        private ParatextProjectDto CreateDto(ParatextProject project)
        {
            return new ParatextProjectDto
            {
                Id = project.Id,
                Name = project.Name,
                LanguageTag = project.LanguageTag,
                LanguageName = project.LanguageName
            };
        }
    }
}
