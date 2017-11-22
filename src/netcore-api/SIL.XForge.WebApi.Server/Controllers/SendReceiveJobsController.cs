using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.Dtos;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Services;
using System.Linq;
using SIL.XForge.WebApi.Server.DataAccess;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.Controllers
{
    [Route("sr_jobs", Name = RouteNames.SendReceiveJobs)]
    public class SendReceiveJobsController : Controller
    {
        private readonly IRepository<SendReceiveJob> _jobRepo;
        private readonly SendReceiveService _sendReceiveService;

        public SendReceiveJobsController(IRepository<SendReceiveJob> jobRepo, SendReceiveService sendReceiveService)
        {
            _jobRepo = jobRepo;
            _sendReceiveService = sendReceiveService;
        }

        [HttpGet]
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
                return Ok(CreateDto(job));
            return NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] string projectId)
        {
            var job = new SendReceiveJob
            {
                Project = projectId
            };
            await _jobRepo.InsertAsync(DbNames.Default, job);
            _sendReceiveService.StartJob(job);
            SendReceiveJobDto dto = CreateDto(job);
            return Created(dto.Href, dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            if (await _jobRepo.DeleteAsync(DbNames.Default, id))
            {
                _sendReceiveService.CancelJob(id);
                return Ok();
            }
            return NotFound();
        }

        private SendReceiveJobDto CreateDto(SendReceiveJob job)
        {
            return new SendReceiveJobDto()
            {
                Id = job.Id.ToString(),
                Href = Url.RouteUrl(RouteNames.SendReceiveJobs) + "/" + job.Id,
                Project = new ResourceDto { Id = job.Project }
            };
        }
    }
}
