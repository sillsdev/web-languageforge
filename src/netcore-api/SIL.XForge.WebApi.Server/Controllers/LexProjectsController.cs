using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos.Lexicon;
using SIL.XForge.WebApi.Server.Models.Lexicon;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("lex_projects")]
    public class LexProjectsController : ProjectResourceController<LexProject>
    {
        public LexProjectsController(IMapper mapper, IRepository<LexProject> lexProjectRepo)
            : base(mapper, lexProjectRepo)
        {
        }

        [HttpGet("{id}", Name = RouteNames.Lexicon)]
        [AllowAnonymous]
        public async Task<IActionResult> GetAsync(string id)
        {
            if ((await ProjectRepo.TryGetAsync(id)).TryResult(out LexProject project))
                return Ok(Map<LexProjectDto>(project));
            return NotFound();
        }

        [HttpPost("{id}/entries")]
        public IActionResult UpdateOrCreateEntry(string id)
        {
            // if (!(await _userRepo.TryGetAsync(GetActualUserId(userId))).TryResult(out User user))
            //     return NotFound();

            // if ((await _paratextService.TryGetUserInfoAsync(user)).TryResult(out ParatextUserInfo userInfo))
            //     return Ok(CreateDto(userInfo));
            return NoContent();
        }
    }
}
