using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel;
using MongoDB.Driver;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("sr_jobs", Name = RouteNames.SendReceiveJobs)]
    public class SendReceiveJobsController : ProjectResourceController<Project>
    {
        private readonly IRepository<SendReceiveJob> _jobRepo;
        private readonly SendReceiveService _sendReceiveService;

        public SendReceiveJobsController(IRepository<Project> projectRepo, IRepository<SendReceiveJob> jobRepo,
            SendReceiveService sendReceiveService)
            : base(projectRepo)
        {
            _jobRepo = jobRepo;
            _sendReceiveService = sendReceiveService;
        }

        [HttpGet]
        [SiteAuthorize(Domain.Projects, Operation.View)]
        public async Task<IEnumerable<SendReceiveJobDto>> GetAllAsync()
        {
            IReadOnlyList<SendReceiveJob> jobs = await _jobRepo.GetAllAsync();
            return jobs.Select(CreateDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAsync(string id)
        {
            if ((await _jobRepo.TryGetAsync(id)).TryResult(out SendReceiveJob job))
            {
                switch (await AuthorizeAsync(job.ProjectRef, new Right(Domain.Projects, Operation.View)))
                {
                    case AuthorizeResult.Success:
                        return Ok(CreateDto(job));

                    case AuthorizeResult.Forbidden:
                        return Forbid();
                }
            }
            return NotFound();
        }

        [HttpPost]
        // TODO: cannot use ProjectAuthorize attribute
        [ProjectAuthorize(Domain.Projects, Operation.Edit)]
        public async Task<IActionResult> CreateAsync([FromBody] string projectId)
        {
            SendReceiveJob job = await _jobRepo.UpdateAsync(j => j.ProjectRef == projectId
                && j.State != SendReceiveJob.IdleState,
                b => b.SetOnInsert(j => j.ProjectRef, projectId)
                      .SetOnInsert(j => j.State, SendReceiveJob.PendingState), true);
            SendReceiveJobDto dto = CreateDto(job);
            if (_sendReceiveService.StartJob(job))
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
                        if (await _jobRepo.DeleteAsync(job))
                        {
                            _sendReceiveService.CancelJob(job);
                            return Ok();
                        }
                        break;

                    case AuthorizeResult.Forbidden:
                        return Forbid();
                }
            }
            return NotFound();
        }

        private SendReceiveJobDto CreateDto(SendReceiveJob job)
        {
            return new SendReceiveJobDto()
            {
                Id = job.Id.ToString(),
                Href = Url.RouteUrl(RouteNames.SendReceiveJobs) + "/" + job.Id,
                Project = new ResourceDto { Id = job.ProjectRef },
                PercentCompleted = job.PercentCompleted,
                State = job.State
            };
        }
    }
}
