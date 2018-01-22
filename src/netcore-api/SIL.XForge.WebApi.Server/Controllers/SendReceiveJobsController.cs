using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;
using System.Collections.Generic;
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

        [HttpGet("{id}", Name = RouteNames.SendReceiveJob)]
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

        [HttpPost]
        [ProjectAuthorize(Domain.Projects, Operation.Edit, "projectId")]
        public async Task<IActionResult> CreateAsync([FromBody] string projectId)
        {
            bool created = (await _sendReceiveService.TryCreateJobAsync(UserId, projectId))
                .TryResult(out SendReceiveJob job);
            SendReceiveJobDto dto = Map<SendReceiveJobDto>(job);
            if (created)
                return Created(dto.Href, dto);
            return Ok(dto);
        }

        [HttpDelete("{id}")]
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
