using EdjCase.JsonRpc.Router;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.Controllers;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Scripture.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Scripture.Controllers
{
    [RpcRoute("projects")]
    public class SFProjectsRpcController : ProjectsRpcController<SFProjectEntity>
    {
        public SFProjectsRpcController(IUserAccessor userAccessor, IHttpRequestAccessor httpRequestAccessor,
            IRepository<UserEntity> users, IEmailService emailService, IOptions<SiteOptions> siteOptions)
            : base(userAccessor, httpRequestAccessor, users, emailService, siteOptions)
        {
        }
    }
}
