using System;
using System.Threading.Tasks;
using System.Web;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Services;
using SIL.XForge.Utils;

namespace SIL.XForge.Controllers
{
    /// <summary>
    /// This controller contains project-related JSON-RPC commands that are common to all xForge applications.
    /// </summary>
    public abstract class ProjectsRpcController<T> : RpcControllerBase where T : ProjectEntity
    {
        private readonly IRepository<UserEntity> _users;
        private readonly IEmailService _emailService;
        private readonly IOptions<SiteOptions> _siteOptions;

        protected ProjectsRpcController(IUserAccessor userAccessor, IHttpRequestAccessor httpRequestAccessor,
            IRepository<UserEntity> users, IEmailService emailService, IOptions<SiteOptions> siteOptions)
            : base(userAccessor, httpRequestAccessor)
        {
            _users = users;
            _emailService = emailService;
            _siteOptions = siteOptions;
        }

        public async Task<string> Invite(string email)
        {
            if (await CreateInvitedUserAccount(email))
            {
                SiteOptions siteOptions = _siteOptions.Value;
                string projectName = "[Project Name]";
                string inviterName = User.Name;
                string url = $"{siteOptions.Origin}identity/sign-up?e={HttpUtility.UrlEncode(email)}";
                string subject = $"You've been invited to the project {projectName} on {siteOptions.Name}";
                string body = "<p>Hello </p><p></p>" +
                    $"<p>{inviterName} invites you to join the {projectName} project on {siteOptions.Name}." +
                    "</p><p></p>" +
                    "<p>You're almost ready to start. Just click the link below to complete your signup and " +
                    "then you will be ready to get started.</p><p></p>" +
                    $"<p>To join, go to {url}</p><p></p>" +
                    $"<p>Regards</p><p>    The {siteOptions.Name} team</p>";
                await _emailService.SendEmailAsync(email, subject, body);
                return "invited";
            }
            else
            {
                // user already exists

                // ToDo: once we have a current project in context - IJH 2018-11
                // if (user is already in the project)
                // {
                //     return "none";
                // }
                // else add the user to the current project

                SiteOptions siteOptions = _siteOptions.Value;
                string projectName = "[Project Name]";
                string inviterName = User.Name;
                string subject = $"You've been added to the project {projectName} on {siteOptions.Name}";
                string body = "<p>Hello </p><p></p>" +
                    $"<p>{inviterName} has just added you to the {projectName} project on {siteOptions.Name}." +
                    "</p><p></p>" +
                    $"<p>Regards</p><p>    The {siteOptions.Name} team</p>";
                await _emailService.SendEmailAsync(email, subject, body);
                return "joined";
            }
        }

        private async Task<bool> CreateInvitedUserAccount(string email)
        {
            try
            {
                var user = new UserEntity
                {
                    Email = email,
                    CanonicalEmail = UserEntity.CanonicalizeEmail(email),
                    EmailVerified = false,
                    Role = SystemRoles.User,
                    ValidationKey = Security.GenerateKey(),
                    ValidationExpirationDate = DateTime.Now.AddDays(7),
                    Active = false
                };
                await _users.InsertAsync(user);
                // add the user to the current project once we have a current project in context
                return true;
            }
            catch (DuplicateKeyException)
            {
                return false;
            }
        }
    }
}
