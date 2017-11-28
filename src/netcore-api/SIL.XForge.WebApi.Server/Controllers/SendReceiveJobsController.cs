using Microsoft.AspNetCore.Mvc;
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
            IReadOnlyList<SendReceiveJob> jobs = await _jobRepo.GetAllAsync(DbNames.Default);
            return jobs.Select(CreateDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAsync(string id)
        {
            SendReceiveJob job = await _jobRepo.GetAsync(DbNames.Default, id);
            if (job != null)
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
        [ProjectAuthorize(Domain.Projects, Operation.Edit)]
        public async Task<IActionResult> CreateAsync([FromBody] string projectId)
        {
            SendReceiveJob job = await _jobRepo.UpdateAsync(DbNames.Default, j => j.ProjectRef == projectId,
                b => b.SetOnInsert(j => j.ProjectRef, projectId), true);
            _sendReceiveService.StartJob(job);
            SendReceiveJobDto dto = CreateDto(job);
            return Created(dto.Href, dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            SendReceiveJob job = await _jobRepo.GetAsync(DbNames.Default, id);
            if (job != null)
            {
                switch (await AuthorizeAsync(job.ProjectRef, new Right(Domain.Projects, Operation.Edit)))
                {
                    case AuthorizeResult.Success:
                        if (await _jobRepo.DeleteAsync(DbNames.Default, job))
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
                Project = new ResourceDto { Id = job.ProjectRef }
            };
        }
    }
}
