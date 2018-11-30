using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Linq.Expressions;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CSharp.RuntimeBinder;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Authentication;
using SIL.XForge.Identity.Configuration;
using SIL.XForge.Identity.Controllers.Account;
using SIL.XForge.Identity.Models;
using SIL.XForge.Models;
using SIL.XForge.Services;
using SIL.XForge.Utils;

namespace SIL.XForge.Identity.Controllers
{
    [Route("identity-api")]
    [ApiController]
    public class IdentityController : ControllerBase
    {
        private const int PasswordResetPeriodDays = 7;
        private const int EmailVerificationPeriodDays = 7;
        private static TimeSpan RememberMeLogInDuration = TimeSpan.FromDays(30);
        private const string verificationUrl = "https://www.google.com/recaptcha/api/siteverify";

        private readonly IRepository<UserEntity> _users;
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IClientStore _clientStore;
        private readonly IEventService _events;
        private readonly IOptions<SiteOptions> _options;
        private readonly IEmailService _emailService;
        private readonly GoogleCaptchaOptions _captcha;

        public IdentityController(IIdentityServerInteractionService interaction, IClientStore clientStore,
            IEventService events, IRepository<UserEntity> users, IOptions<SiteOptions> options,
            IEmailService emailService, IOptions<GoogleCaptchaOptions> captcha)
        {
            _users = users;
            _interaction = interaction;
            _clientStore = clientStore;
            _events = events;
            _options = options;
            _emailService = emailService;
            _captcha = captcha.Value;
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
                    .Set(u => u.ResetPasswordKey, Security.GenerateKey())
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

        [HttpGet("captcha-id")]
        public string CaptchaId()
        {
            return _captcha.CaptchaId;
        }

        [HttpPost("verify-recaptcha")]
        public async Task<ActionResult<IdentityResult>> VerifyRecaptchaResponse(VerifyRecaptchaParams parameters)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    var values = new Dictionary<string, string>
                    {
                        { "secret", _captcha.CaptchaSecret },
                        { "response", parameters.RecaptchaResponse },
                    };
                    var content = new FormUrlEncodedContent(values);

                    HttpResponseMessage response;
                    response = await client.PostAsync(verificationUrl, content);


                    var responseString = await response.Content.ReadAsStringAsync();

                    var converter = new ExpandoObjectConverter();

                    dynamic obj = JsonConvert.DeserializeObject<ExpandoObject>(responseString, converter);
                    return new IdentityResult(obj.success);
                }
                catch (RuntimeBinderException) { }
            }
            return new IdentityResult(false);
        }

        [HttpPost("sign-up")]
        public async Task<ActionResult<SignUpResult>> SignUp(SignUpParams parameters)
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
                        return new SignUpResult
                        {
                            Success = true
                        };
                    }
                }
                else if (existingUser.VerifyPassword(parameters.Password))
                {
                    // check for signup from other site
                    // ToDo
                }
                else
                {
                    return new SignUpResult
                    {
                        Success = false,
                        Reason = "Duplicate Email"
                    };
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
                    ValidationKey = Security.GenerateKey(),
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

                    return new SignUpResult
                    {
                        Success = true
                    };
                }
            }

            return new SignUpResult
            {
                Success = false
            };
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

        /// <summary>
        /// initiate roundtrip to external authentication provider
        /// </summary>
        [HttpGet("challenge")]
        public IActionResult Challenge(string provider, string returnUrl, string userId)
        {
            if (string.IsNullOrEmpty(returnUrl))
                returnUrl = "~/";

            // validate returnUrl - either it is a valid OIDC URL or back to a local page
            if (Url.IsLocalUrl(returnUrl) == false && _interaction.IsValidReturnUrl(returnUrl) == false)
            {
                // user might have clicked on a malicious link - should be logged
                throw new Exception("invalid return URL");
            }

            // start challenge and roundtrip the return URL and scheme
            var props = new AuthenticationProperties
            {
                RedirectUri = Url.Action(nameof(Callback)),
                Items =
                {
                    { "returnUrl", returnUrl },
                    { "scheme", provider }
                }
            };

            if (!string.IsNullOrEmpty(userId))
                props.Items["userId"] = userId;

            return Challenge(props, provider);
        }

        /// <summary>
        /// Post processing of external authentication
        /// </summary>
        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            // read external identity from the temporary cookie
            AuthenticateResult result = await HttpContext.AuthenticateAsync(
                IdentityServerConstants.ExternalCookieAuthenticationScheme);
            if (result?.Succeeded != true)
            {
                throw new Exception("External authentication error");
            }

            // lookup our user and external provider info
            UserEntity user = await GetUserFromExternalProviderAsync(result);

            // this allows us to collect any additonal claims or properties
            // for the specific prtotocols used and store them in the local auth cookie.
            // this is typically used to store data needed for signout from those protocols.
            var additionalLocalClaims = new List<Claim>();
            var localSignInProps = new AuthenticationProperties();
            // TODO: allow user to specify whether to remember the login
            if (AccountOptions.AllowRememberLogin)
            {
                localSignInProps.IsPersistent = true;
                localSignInProps.ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration);
            };
            ProcessLoginCallbackForOidc(result, additionalLocalClaims, localSignInProps);
            ProcessLoginCallbackForWsFed(result, additionalLocalClaims, localSignInProps);
            ProcessLoginCallbackForSaml2p(result, additionalLocalClaims, localSignInProps);

            // try to determine the unique id of the external user (issued by the provider)
            // the most common claim type for that are the sub claim and the NameIdentifier
            // depending on the external provider, some other claim type might be used
            Claim userIdClaim = result.Principal.FindFirst(JwtClaimTypes.Subject)
                ?? result.Principal.FindFirst(ClaimTypes.NameIdentifier);

            string provider = result.Properties.Items["scheme"];

            // issue authentication cookie for user
            await _events.RaiseAsync(new UserLoginSuccessEvent(provider, userIdClaim.Value, user.Id, user.Username));
            await HttpContext.SignInAsync(user.Id, user.Username, provider, localSignInProps,
                additionalLocalClaims.ToArray());

            // delete temporary cookie used during external authentication
            await HttpContext.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);

            // retrieve return URL
            string returnUrl = result.Properties.Items["returnUrl"] ?? "~/";

            return Redirect(returnUrl);
        }

        private async Task<UserEntity> GetUserFromExternalProviderAsync(AuthenticateResult result)
        {
            ClaimsPrincipal externalUser = result.Principal;
            Claim userIdClaim = externalUser.FindFirst(JwtClaimTypes.Subject)
                ?? externalUser.FindFirst(ClaimTypes.NameIdentifier);
            string externalUserId = userIdClaim?.Value ?? "";
            Claim emailClaim = externalUser.FindFirst(JwtClaimTypes.Email)
                ?? externalUser.FindFirst(ClaimTypes.Email);
            string email = emailClaim?.Value ?? "";
            Claim nameClaim = externalUser.FindFirst(JwtClaimTypes.Name)
                ?? externalUser.FindFirst(ClaimTypes.Name);
            string name = nameClaim?.Value ?? "";

            UserEntity user = null;
            string provider = result.Properties.Items["scheme"];
            Expression<Func<UserEntity, bool>> predicate = null;
            if (result.Properties.Items.TryGetValue("userId", out string userId))
                predicate = u => u.Id == userId;
            switch (provider)
            {
                case ParatextAuthenticationDefaults.AuthenticationScheme:
                    if (predicate == null)
                        predicate = u => u.ParatextId == externalUserId || u.Email == email;
                    var paratextTokens = new Tokens
                    {
                        AccessToken = result.Properties.GetTokenValue("access_token"),
                        RefreshToken = result.Properties.GetTokenValue("refresh_token")
                    };
                    user = await _users.UpdateAsync(predicate, update => update
                        .Set(u => u.ParatextId, externalUserId)
                        .Set(u => u.ParatextTokens, paratextTokens));
                    break;
                default:
                    throw new Exception("Unknown external authentication scheme.");
            }
            if (user != null)
                return user;

            // TODO: create user
            throw new NotImplementedException();
        }

        private void ProcessLoginCallbackForOidc(AuthenticateResult externalResult, List<Claim> localClaims,
            AuthenticationProperties localSignInProps)
        {
            // if the external system sent a session id claim, copy it over
            // so we can use it for single sign-out
            Claim sid = externalResult.Principal.Claims.FirstOrDefault(x => x.Type == JwtClaimTypes.SessionId);
            if (sid != null)
                localClaims.Add(new Claim(JwtClaimTypes.SessionId, sid.Value));

            // if the external provider issued an id_token, we'll keep it for signout
            string id_token = externalResult.Properties.GetTokenValue("id_token");
            if (id_token != null)
                localSignInProps.StoreTokens(new[] { new AuthenticationToken { Name = "id_token", Value = id_token } });
        }

        private void ProcessLoginCallbackForWsFed(AuthenticateResult externalResult, List<Claim> localClaims,
            AuthenticationProperties localSignInProps)
        {
        }

        private void ProcessLoginCallbackForSaml2p(AuthenticateResult externalResult, List<Claim> localClaims,
            AuthenticationProperties localSignInProps)
        {
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
