using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Dtos.Lexicon;
using SIL.XForge.WebApi.Server.Models.Lexicon;
using SIL.XForge.WebApi.Server.Services;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("lex_projects")]
    public class LexProjectsController : ProjectResourceController<LexProject>
    {
        private readonly IProjectRepositoryFactory<LexEntry> _lexEntryRepoFactory;
        private readonly AssetService _assetService;

        public LexProjectsController(IMapper mapper, IRepository<LexProject> lexProjectRepo,
            IProjectRepositoryFactory<LexEntry> lexEntryRepoFactory, AssetService assetService)
            : base(mapper, lexProjectRepo)
        {
            _lexEntryRepoFactory = lexEntryRepoFactory;
            _assetService = assetService;
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

        [HttpPost("{id}/assets")]
        [RequestSizeLimit(100_000_000)]
        [AllowAnonymous]
        public async Task<IActionResult> CreateAssetAsync(string id, IFormFile file, string mediaType)
        {
            AssetType assetType;
            switch (mediaType)
            {
                case "audio":
                    assetType = AssetType.Audio;
                    break;
                case "sense-image":
                    assetType = AssetType.Picture;
                    break;
                default:
                    return BadRequest();
            }

            if (!(await ProjectRepo.TryGetAsync(id)).TryResult(out LexProject project))
                return NotFound();

            string relativeFilePath = await _assetService.SaveAssetAsync(project, file, assetType);
            string relativeDirPath = Path.GetDirectoryName(relativeFilePath).Replace('\\', '/');
            string fileName = Path.GetFileName(relativeFilePath);
            string url = Uri.EscapeUriString("/" + relativeFilePath.Replace('\\', '/'));
            return Created(url, new AssetDto { Path = relativeDirPath, FileName = fileName });
        }
    }
}
