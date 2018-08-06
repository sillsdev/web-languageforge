using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("users")]
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

        /// <summary>
        /// Gets Paratext information.
        /// </summary>
        /// <param name="id">The user id.</param>
        /// <response code="204">The user has not logged into Paratext.</response>
        [HttpGet("{id}/paratext")]
        [SiteAuthorize(Domain.Users, Operation.ViewOwn)]
        [ProducesResponseType(typeof(ParatextUserInfoDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetParatextInfoAsync(string id)
        {
            if (!(await _userRepo.TryGetAsync(GetActualUserId(id))).TryResult(out User user))
                return NotFound();

            if ((await _paratextService.TryGetUserInfoAsync(user)).TryResult(out ParatextUserInfo userInfo))
                return Ok(Map<ParatextUserInfoDto>(userInfo));
            return NoContent();
        }

        /// <summary>
        /// Gets the user's projects.
        /// </summary>
        /// <param name="id">The user id.</param>
        [HttpGet("{id}/projects")]
        [SiteAuthorize(Domain.Projects, Operation.ViewOwn)]
        [ProducesResponseType(typeof(IEnumerable<ResourceDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProjectsAsync(string id)
        {
            if (!(await _userRepo.TryGetAsync(GetActualUserId(id))).TryResult(out User user))
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
