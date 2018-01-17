using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos.Lexicon;
using SIL.XForge.WebApi.Server.Models.Lexicon;
using System;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("lex_projects")]
    public class LexProjectsController : ProjectResourceController<LexProject>
    {
        private readonly IProjectRepositoryFactory<LexEntry> _lexEntryRepoFactory;

        public LexProjectsController(IMapper mapper, IRepository<LexProject> lexProjectRepo,
            IProjectRepositoryFactory<LexEntry> lexEntryRepoFactory)
            : base(mapper, lexProjectRepo)
        {
            _lexEntryRepoFactory = lexEntryRepoFactory;
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
        [AllowAnonymous]
        public async Task<IActionResult> CreateEntryAsync(string id, [FromBody] LexEntryDto entryDto)
        {
            if (!(await ProjectRepo.TryGetAsync(id)).TryResult(out LexProject project))
                return NotFound();

            IRepository<LexEntry> lexEntryRepo = _lexEntryRepoFactory.Create(project);
            LexEntry entry = Map<LexEntry>(entryDto);
            var now = DateTime.UtcNow;
            string userId = UserId;
            entry.AuthorInfo.CreatedByUserRef = userId;
            entry.AuthorInfo.CreatedDate = now;
            entry.AuthorInfo.ModifiedByUserRef = userId;
            entry.AuthorInfo.ModifiedDate = now;
            if (await lexEntryRepo.InsertAsync(entry))
            {
                entryDto = Map<LexEntryDto>(entry, RouteNames.LexEntry, new { id, entryId = entry.Id });
                return Created(entryDto.Href, entryDto);
            }
            return StatusCode(409);
        }

        [HttpGet("{id}/entries/{entryId}", Name = RouteNames.LexEntry)]
        [AllowAnonymous]
        public async Task<IActionResult> GetEntryAsync(string id, string entryId)
        {
            if (!(await ProjectRepo.TryGetAsync(id)).TryResult(out LexProject project))
                return NotFound();

            IRepository<LexEntry> lexEntryRepo = _lexEntryRepoFactory.Create(project);
            if (!(await lexEntryRepo.TryGetAsync(entryId)).TryResult(out LexEntry entry))
                return NotFound();

            return Ok(Map<LexEntryDto>(entry, RouteNames.LexEntry));
        }
    }
}
