using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using IdentityModel;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Models;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Identity.Controllers
{
    [Route("identity-api")]
    [ApiController]
    public class IdentityController : ControllerBase
    {
        private const int PasswordResetPeriodDays = 7;
        private const int EmailVerificationPeriodDays = 7;
        private static TimeSpan RememberMeLogInDuration = TimeSpan.FromDays(30);

        private readonly IRepository<UserEntity> _users;
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IClientStore _clientStore;
        private readonly IEventService _events;
        private readonly IOptions<SiteOptions> _options;
        private readonly IEmailService _emailService;

        public IdentityController(IIdentityServerInteractionService interaction, IClientStore clientStore,
            IEventService events, IRepository<UserEntity> users, IOptions<SiteOptions> options,
            IEmailService emailService)
        {
            _users = users;
            _interaction = interaction;
            _clientStore = clientStore;
            _events = events;
            _options = options;
            _emailService = emailService;
        }

        [HttpPost("log-in")]
        public async Task<ActionResult<LogInResult>> LogIn(LogInParams parameters)
        {
            UserEntity user = await _users.Query().SingleOrDefaultAsync(u => u.Username == parameters.User
                || u.CanonicalEmail == UserEntity.CanonicalizeEmail(parameters.User));
            // validate username/password
            if (user != null && user.VerifyPassword(parameters.Password))
            {
                await LogInUserAsync(user, parameters.RememberLogIn);
                AuthorizationRequest context = await _interaction.GetAuthorizationContextAsync(parameters.ReturnUrl);
                bool trusted = context != null;
                if (!trusted)
                    trusted = Url.IsLocalUrl(parameters.ReturnUrl);
                return new LogInResult
                {
                    Success = true,
                    IsReturnUrlTrusted = trusted
                };
            }

            await _events.RaiseAsync(new UserLoginFailureEvent(parameters.User, "invalid credentials"));
            return new LogInResult { Success = false };
        }

        [HttpGet("log-out")]
        public async Task<ActionResult> LogOut([FromQuery] string logOutId)
        {
            LogoutRequest logout = await _interaction.GetLogoutContextAsync(logOutId);
            string externalAuthenticationScheme = null;
            if (User?.Identity.IsAuthenticated == true)
            {
                string idp = User.FindFirst(JwtClaimTypes.IdentityProvider)?.Value;
                if (idp != null && idp != IdentityServer4.IdentityServerConstants.LocalIdentityProvider)
                {
                    bool providerSupportsSignout = await HttpContext.GetSchemeSupportsSignOutAsync(idp);
                    if (providerSupportsSignout)
                    {
                        if (logOutId == null)
                        {
                            // if there's no current logout context, we need to create one
                            // this captures necessary info from the current logged in user
                            // before we signout and redirect away to the external IdP for signout
                            logOutId = await _interaction.CreateLogoutContextAsync();
                        }

                        externalAuthenticationScheme = idp;
                    }
                }

                // delete local authentication cookie
                await HttpContext.SignOutAsync();

                // raise the logout event
                await _events.RaiseAsync(new UserLogoutSuccessEvent(User.GetSubjectId(), User.GetDisplayName()));
            }

            // check if we need to trigger sign-out at an upstream identity provider
            if (externalAuthenticationScheme != null)
            {
                // build a return URL so the upstream provider will redirect back
                // to us after the user has logged out. this allows us to then
                // complete our single sign-out processing.
                string url = Url.Action(nameof(LogOut), new { logOutId });

                // this triggers a redirect to the external provider for sign-out
                return SignOut(new AuthenticationProperties { RedirectUri = url }, externalAuthenticationScheme);
            }

            return Redirect(logout?.PostLogoutRedirectUri ?? "/");
        }

        /// <summary>
        /// Validate username or email and send email
        /// </summary>
        [HttpPost("forgot-password")]
        public async Task<ActionResult<IdentityResult>> ForgotPassword(ForgotPasswordParams parameters)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.Username == parameters.User || u.CanonicalEmail == UserEntity.CanonicalizeEmail(parameters.User),
                update => update
                    .Set(u => u.ResetPasswordKey, GenerateKey())
                    .Set(u => u.ResetPasswordExpirationDate, DateTime.UtcNow.AddDays(PasswordResetPeriodDays)));
            if (user != null)
            {
                SiteOptions siteOptions = _options.Value;
                var subject = $"{siteOptions.Name} Forgotten Password Verification";
                Uri url = new Uri(siteOptions.Origin, $"identity/reset-password?token={user.ResetPasswordKey}");
                var body = "<div>"
                    + $"<h1>Reset Password for {user.Name}</h1>"
                    + $"<p>Please click this link to <a href=\"{url}\" target=\"_blank\">Reset Your Password</a>.</p>"
                    + "<p>This link will be valid for 1 week.</p>"
                    + $"<p>Regards,<br>The {siteOptions.Name} team</p>"
                    + "</div>";

                await _emailService.SendEmailAsync(user.Email, subject, body);
                return new IdentityResult(true);
            }

            return new IdentityResult(false);
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult<IdentityResult>> ResetPassword(ResetPasswordParams parameters)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.ResetPasswordKey == parameters.Key && u.ResetPasswordExpirationDate > DateTime.UtcNow,
                update => update
                    .Set(u => u.Password, BCrypt.Net.BCrypt.HashPassword(parameters.Password, 7))
                    .Unset(u => u.ResetPasswordKey)
                    .Unset(u => u.ResetPasswordExpirationDate));
            if (user != null)
            {
                await LogInUserAsync(user);
                return new IdentityResult(true);
            }
            return new IdentityResult(false);
        }

        [HttpPost("send-invite")]
        public async Task<ActionResult<SendInviteResult>> SendInvite(SendInviteParams parameters)
        {
            if (!string.IsNullOrEmpty(parameters.Email))
            {
                if (await CreateInvitedUserAccount(parameters.Email))
                {
                    SiteOptions siteOptions = _options.Value;
                    string projectName = "[Project Name]";
                    string inviterName = User.GetDisplayName();
                    string url = $"{siteOptions.Origin}Account/Register?e={HttpUtility.UrlEncode(parameters.Email)}";
                    string subject = $"You've been invited to the project {projectName} on {siteOptions.Name}";
                    string body = "<p>Hello </p><p></p>" +
                        $"<p>{inviterName} invites you to join the {projectName} project on {siteOptions.Name}." +
                        "</p><p></p>" +
                        "<p>You're almost ready to start. Just click the link below to complete your signup and " +
                        "then you will be ready to get started.</p><p></p>" +
                        $"<p>To join, go to {url}</p><p></p>" +
                        $"<p>Regards</p><p>    The {siteOptions.Name} team</p>";
                    await _emailService.SendEmailAsync(parameters.Email, subject, body);
                    return new SendInviteResult
                    {
                        Success = true,
                        EmailTypeSent = "invited"
                    };
                }
                else
                {
                    // user already exists

                    // ToDo: once we have a current project in context - IJH 2018-11
                    // if (user is already in the project)
                    // {
                    //     return new SendInviteResult
                    //     {
                    //         Success = true,
                    //         IsAlreadyInProject = true
                    //     };
                    // }
                    // else add the user to the current project

                    SiteOptions siteOptions = _options.Value;
                    string projectName = "[Project Name]";
                    string inviterName = User.GetDisplayName();
                    string subject = $"You've been added to the project {projectName} on {siteOptions.Name}";
                    string body = "<p>Hello </p><p></p>" +
                        $"<p>{inviterName} has just added you to the {projectName} project on {siteOptions.Name}." +
                        "</p><p></p>" +
                        $"<p>Regards</p><p>    The {siteOptions.Name} team</p>";
                    await _emailService.SendEmailAsync(parameters.Email, subject, body);
                    return new SendInviteResult
                    {
                        Success = true,
                        EmailTypeSent = "joined"
                    };
                }
            }

            return new SendInviteResult
            {
                Success = false
            };
        }

        [HttpPost("sign-up")]
        public async Task<ActionResult<IdentityResult>> SignUp(SignUpParams parameters)
        {
            UserEntity existingUser = await _users.Query()
                .SingleOrDefaultAsync(u => u.CanonicalEmail == UserEntity.CanonicalizeEmail(parameters.Email));
            if (existingUser != null)
            {
                if (!existingUser.Active && existingUser.Password == null)
                {
                    // invited user - activate, update and login user
                    existingUser = await _users
                        .UpdateAsync(u => u.CanonicalEmail == UserEntity.CanonicalizeEmail(parameters.Email),
                            update => update.Set(u => u.EmailVerified, true)
                                .Set(u => u.Name, parameters.Name)
                                .Set(u => u.Password, BCrypt.Net.BCrypt.HashPassword(parameters.Password, 7))
                                .Set(u => u.Active, true));
                    if (existingUser != null)
                    {
                        await LogInUserAsync(existingUser);
                        return new IdentityResult(true);
                    }
                }
                else if (existingUser.VerifyPassword(parameters.Password))
                {
                    // check for signup from other site
                    // ToDo
                }
            }
            else
            {
                var user = new UserEntity
                {
                    Name = parameters.Name,
                    Email = parameters.Email,
                    CanonicalEmail = UserEntity.CanonicalizeEmail(parameters.Email),
                    EmailVerified = false,
                    Password = BCrypt.Net.BCrypt.HashPassword(parameters.Password, 7),
                    Role = SystemRoles.User,
                    ValidationKey = GenerateKey(),
                    ValidationExpirationDate = DateTime.UtcNow.AddDays(EmailVerificationPeriodDays),
                    Active = true
                };

                if (await _users.InsertAsync(user))
                {
                    await LogInUserAsync(user);

                    SiteOptions siteOptions = _options.Value;
                    string subject = $"{siteOptions.Name} - Email Verification";
                    Uri url = new Uri(siteOptions.Origin,
                        $"account/VerifyEmail?email={user.Email}&key={user.ValidationKey}");
                    string body = "<div>"
                        + $"<h1>Dear {user.Name},</h1>"
                        + $"<p>Please click this link to verify your email <a href=\"{url}\" target=\"_blank\">"
                        + "Confirm Verification</a>.</p>"
                        + $"<p>Regards,<br>The {siteOptions.Name} Team</p>"
                        + "</div>";

                    await _emailService.SendEmailAsync(user.Email, subject, body);

                    return new IdentityResult(true);
                }
            }

            return new IdentityResult(false);
        }

        [HttpPost("verify-email")]
        public async Task<ActionResult<IdentityResult>> VerifyEmail(VerifyEmailParams parameters)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.ValidationKey == parameters.Key && u.ValidationExpirationDate > DateTime.UtcNow,
                update => update
                    .Set(u => u.EmailVerified, true)
                    .Unset(u => u.ValidationKey)
                    .Unset(u => u.ValidationExpirationDate));
            if (user != null)
                return new IdentityResult(true);
            return new IdentityResult(false);
        }

        [HttpPost("verify-token")]
        public async Task<ActionResult<IdentityResult>> VerifyToken(VerifyTokenParams parameters)
        {
            UserEntity user = await _users.Query().SingleOrDefaultAsync(u => u.ResetPasswordKey == parameters.Token &&
                u.ResetPasswordExpirationDate > DateTime.UtcNow);
            if (user != null)
            {
                return new IdentityResult(true);
            }
            return new IdentityResult(false);
        }

        private async Task<bool> CreateInvitedUserAccount(string email)
        {
            var user = new UserEntity
            {
                Name = string.Empty,
                Email = email,
                CanonicalEmail = UserEntity.CanonicalizeEmail(email),
                EmailVerified = false,
                Password = string.Empty,
                Role = SystemRoles.User,
                ValidationKey = GenerateKey(),
                ValidationExpirationDate = DateTime.Now.AddDays(7),
                Active = false
            };

            var result = await _users.InsertAsync(user);

            // add the user to the current project once we have a current project in context

            return result;
        }

        private static string GenerateKey()
        {
            char[] chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();
            byte[] data = new byte[1];
            using (RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider())
            {
                crypto.GetNonZeroBytes(data);
                data = new byte[16];
                crypto.GetNonZeroBytes(data);
            }
            var key = new StringBuilder(16);
            foreach (byte b in data)
            {
                key.Append(chars[b % (chars.Length)]);
            }
            return key.ToString();
        }

        private async Task LogInUserAsync(UserEntity user, bool rememberLogIn = false)
        {
            await _events.RaiseAsync(new UserLoginSuccessEvent(user.Email, user.Id, user.Name));
            // only set explicit expiration here if user chooses "remember me".
            // otherwise we rely upon expiration configured in cookie middleware.
            AuthenticationProperties props = null;
            if (rememberLogIn)
            {
                props = new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.Add(RememberMeLogInDuration)
                };
            };
            // issue authentication cookie with subject ID and name
            await HttpContext.SignInAsync(user.Id, user.Name, props);
        }
    }
}
