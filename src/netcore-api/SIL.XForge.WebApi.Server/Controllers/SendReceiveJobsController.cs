using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("sr_jobs")]
    public class SendReceiveJobsController : ProjectResourceController<Project>
    {
        private readonly IRepository<SendReceiveJob> _jobRepo;
        private readonly SendReceiveService _sendReceiveService;

        public SendReceiveJobsController(IMapper mapper, IRepository<Project> projectRepo,
            IRepository<SendReceiveJob> jobRepo, SendReceiveService sendReceiveService)
            : base(mapper, projectRepo)
        {
            _jobRepo = jobRepo;
            _sendReceiveService = sendReceiveService;
        }

        /// <summary>
        /// Gets all matching send/receive jobs.
        /// </summary>
        /// <param name="project">The project id filter.</param>
        /// <param name="active">If true, gets executing jobs, otherwise gets idle jobs.</param>
        [HttpGet]
        public async Task<IEnumerable<SendReceiveJobDto>> QueryAsync([FromQuery] string project,
            [FromQuery] bool? active)
        {
            IMongoQueryable<SendReceiveJob> query = _jobRepo.Query();
            if (project != null)
                query = query.Where(j => j.ProjectRef == project);
            if (active != null)
            {
                if (active.Value)
                {
                    query = query.Where(j => j.State == SendReceiveJob.PendingState
                        || j.State == SendReceiveJob.SyncingState);
                }
                else
                {
                    query = query.Where(j => j.State == SendReceiveJob.IdleState
                        || j.State == SendReceiveJob.HoldState);
                }
            }
            var dtos = new List<SendReceiveJobDto>();
            var right = new Right(Domain.Projects, Operation.View);
            foreach (SendReceiveJob job in await query.ToListAsync())
            {
                if ((await AuthorizeAsync(job.ProjectRef, right)) == AuthorizeResult.Success)
                    dtos.Add(Map<SendReceiveJobDto>(job));
            }
            return dtos;
        }

        /// <summary>
        /// Gets a send/receive job.
        /// </summary>
        /// <param name="id">The job id.</param>
        [HttpGet("{id}", Name = RouteNames.SendReceiveJob)]
        [ProducesResponseType(typeof(SendReceiveJobDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetAsync(string id)
        {
            if ((await _jobRepo.TryGetAsync(id)).TryResult(out SendReceiveJob job))
            {
                switch (await AuthorizeAsync(job.ProjectRef, new Right(Domain.Projects, Operation.View)))
                {
                    case AuthorizeResult.Success:
                        return Ok(Map<SendReceiveJobDto>(job));

                    case AuthorizeResult.Forbidden:
                        return Forbid();
                }
            }
            return NotFound();
        }

        /// <summary>
        /// Starts a send/receive job.
        /// </summary>
        /// <param name="projectId">The project id.</param>
        /// <response code="201">The job was started successfully.</response>
        /// <response code="200">A job is already active for the project. Returns the active job.</response>
        [HttpPost]
        [ProjectAuthorize(Domain.Projects, Operation.Edit, "projectId")]
        [ProducesResponseType(typeof(SendReceiveJobDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(SendReceiveJobDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> CreateAsync([FromBody, Required] string projectId)
        {
            bool created = (await _sendReceiveService.TryCreateJobAsync(UserId, projectId))
                .TryResult(out SendReceiveJob job);
            SendReceiveJobDto dto = Map<SendReceiveJobDto>(job);
            if (created)
                return Created(dto.Href, dto);
            return Ok(dto);
        }

        /// <summary>
        /// Cancels and deletes a send/receive job.
        /// </summary>
        /// <param name="id">The job id.</param>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            if ((await _jobRepo.TryGetAsync(id)).TryResult(out SendReceiveJob job))
            {
                switch (await AuthorizeAsync(job.ProjectRef, new Right(Domain.Projects, Operation.Edit)))
                {
                    case AuthorizeResult.Success:
                        if (await _sendReceiveService.DeleteJobAsync(job))
                            return Ok();
                        break;

                    case AuthorizeResult.Forbidden:
                        return Forbid();
                }
            }
            return NotFound();
        }
    }
}
