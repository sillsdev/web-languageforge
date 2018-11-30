using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Controllers
{
    public class TestProjectsRpcController : ProjectsRpcController<ProjectEntity>
    {
        public TestProjectsRpcController(IUserAccessor userAccessor, IHttpRequestAccessor httpRequestAccessor,
            IRepository<UserEntity> users, IEmailService emailService, IOptions<SiteOptions> siteOptions)
            : base(userAccessor, httpRequestAccessor, users, emailService, siteOptions)
        {
        }
    }
}
