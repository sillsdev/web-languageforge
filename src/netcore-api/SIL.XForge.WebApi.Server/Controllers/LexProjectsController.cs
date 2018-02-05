using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Dtos.Lexicon;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Models.Lexicon;
using SIL.XForge.WebApi.Server.Services;
using System;
using System.ComponentModel.DataAnnotations;
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

        /// <summary>
        /// Gets a lexicon project.
        /// </summary>
        /// <param name="id">The project id.</param>
        [HttpGet("{id}", Name = RouteNames.Lexicon)]
        [ProjectAuthorize(Domain.Projects, Operation.View)]
        [ProducesResponseType(typeof(LexProjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAsync(string id)
        {
            if ((await ProjectRepo.TryGetAsync(id)).TryResult(out LexProject project))
                return Ok(Map<LexProjectDto>(project));
            return NotFound();
        }

        /// <summary>
        /// Creates a new lexical entry.
        /// </summary>
        /// <param name="id">The project id.</param>
        /// <param name="entryDto">The new lexical entry.</param>
        /// <response code="409">An entry with the specified id already exists.</response>
        [HttpPost("{id}/entries")]
        [ProjectAuthorize(Domain.Entries, Operation.Edit)]
        [ProducesResponseType(typeof(LexEntryDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CreateEntryAsync(string id, [FromBody, Required] LexEntryDto entryDto)
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
            return StatusCode(StatusCodes.Status409Conflict);
        }

        /// <summary>
        /// Gets a lexical entry.
        /// </summary>
        /// <param name="id">The project id.</param>
        /// <param name="entryId">The entry id.</param>
        [HttpGet("{id}/entries/{entryId}", Name = RouteNames.LexEntry)]
        [ProjectAuthorize(Domain.Entries, Operation.View)]
        [ProducesResponseType(typeof(LexEntryDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetEntryAsync(string id, string entryId)
        {
            if (!(await ProjectRepo.TryGetAsync(id)).TryResult(out LexProject project))
                return NotFound();

            IRepository<LexEntry> lexEntryRepo = _lexEntryRepoFactory.Create(project);
            if (!(await lexEntryRepo.TryGetAsync(entryId)).TryResult(out LexEntry entry))
                return NotFound();

            return Ok(Map<LexEntryDto>(entry, RouteNames.LexEntry));
        }

        /// <summary>
        /// Uploads a project asset (audio or image).
        /// </summary>
        /// <param name="id">The project id.</param>
        /// <param name="file">The file.</param>
        /// <param name="mediaType">The media type ("audio" or "sense-image").</param>
        /// <response code="400">An invalid media type was specified.</response>
        [HttpPost("{id}/assets")]
        [ProjectAuthorize(Domain.Entries, Operation.Edit)]
        [RequestSizeLimit(100_000_000)]
        [ProducesResponseType(typeof(AssetDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateAssetAsync(string id, [FromForm, Required] IFormFile file,
            [FromForm, Required] string mediaType)
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
