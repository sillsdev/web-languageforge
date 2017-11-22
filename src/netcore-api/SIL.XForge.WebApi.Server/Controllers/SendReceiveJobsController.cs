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
            SendReceiveJob job = await _jobRepo.UpdateAsync(DbNames.Default, j => j.Project == projectId,
                b => b.SetOnInsert(j => j.Project, projectId), true);
            _sendReceiveService.StartJob(job);
            SendReceiveJobDto dto = CreateDto(job);
            return Created(dto.Href, dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAsync(string id)
        {
            SendReceiveJob job = await _jobRepo.DeleteAsync(DbNames.Default, j => j.Id == id);
            if (job != null)
            {
                _sendReceiveService.CancelJob(job);
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
