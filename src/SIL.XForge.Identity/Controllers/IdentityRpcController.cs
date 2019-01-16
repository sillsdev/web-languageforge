using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using EdjCase.JsonRpc.Router;
using IdentityServer4.Events;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Configuration;
using SIL.XForge.Identity.Models;
using SIL.XForge.Identity.Services;
using SIL.XForge.Models;
using SIL.XForge.Services;
using SIL.XForge.Utils;

namespace SIL.XForge.Identity.Controllers
{
    public class IdentityRpcController : RpcController
    {
        private const string VerificationUrl = "https://www.google.com/recaptcha/api/siteverify";

        private readonly IRepository<UserEntity> _users;
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IClientStore _clientStore;
        private readonly IEventService _events;
        private readonly IOptions<SiteOptions> _siteOptions;
        private readonly IEmailService _emailService;
        private readonly IOptions<GoogleCaptchaOptions> _captchaOptions;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IExternalAuthenticationService _externalAuthService;

        public IdentityRpcController(IIdentityServerInteractionService interaction, IClientStore clientStore,
            IEventService events, IRepository<UserEntity> users, IOptions<SiteOptions> options,
            IEmailService emailService, IOptions<GoogleCaptchaOptions> captchaOptions,
            IHttpContextAccessor httpContextAccessor, IExternalAuthenticationService externalAuthService)
        {
            _users = users;
            _interaction = interaction;
            _clientStore = clientStore;
            _events = events;
            _siteOptions = options;
            _emailService = emailService;
            _captchaOptions = captchaOptions;
            _httpContextAccessor = httpContextAccessor;
            _externalAuthService = externalAuthService;
        }

        public async Task<LogInResult> LogIn(string userIdentifier, string password, bool rememberLogIn,
            string returnUrl = null)
        {
            Attempt<UserEntity> attempt = await _users.TryGetByIdentifier(userIdentifier);
            // validate username/password
            if (attempt.TryResult(out UserEntity user) && user.VerifyPassword(password))
            {
                await LogInUserAsync(user, rememberLogIn);
                AuthorizationRequest context = await _interaction.GetAuthorizationContextAsync(returnUrl);
                bool trusted = context != null;
                if (!trusted)
                    trusted = !string.IsNullOrEmpty(returnUrl) && returnUrl.StartsWith("/");
                return new LogInResult
                {
                    Success = true,
                    IsReturnUrlTrusted = trusted
                };
            }

            await _events.RaiseAsync(new UserLoginFailureEvent(userIdentifier, "invalid credentials"));
            return new LogInResult { Success = false };
        }

        /// <summary>
        /// Validate username or email and send email
        /// </summary>
        public async Task<bool> ForgotPassword(string userIdentifier)
        {
            UserEntity user = await _users.UpdateByIdentifierAsync(userIdentifier, update => update
                .Set(u => u.ResetPasswordKey, Security.GenerateKey())
                .Set(u => u.ResetPasswordExpirationDate,
                    DateTime.UtcNow.AddDays(IdentityConstants.PasswordResetPeriodDays)));
            if (user != null)
            {
                SiteOptions siteOptions = _siteOptions.Value;
                var subject = $"{siteOptions.Name} Forgotten Password Verification";
                Uri url = new Uri(siteOptions.Origin, $"identity/reset-password?key={user.ResetPasswordKey}");
                var body = "<div>"
                    + $"<h1>Reset Password for {user.Name}</h1>"
                    + $"<p>Please click this link to <a href=\"{url}\" target=\"_blank\">Reset Your Password</a>.</p>"
                    + "<p>This link will be valid for 1 week.</p>"
                    + $"<p>Regards,<br>The {siteOptions.Name} team</p>"
                    + "</div>";

                await _emailService.SendEmailAsync(user.Email, subject, body);
                return true;
            }

            return false;
        }

        public async Task<bool> ResetPassword(string key, string password)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.ResetPasswordKey == key && u.ResetPasswordExpirationDate > DateTime.UtcNow,
                update => update
                    .Set(u => u.Password, UserEntity.HashPassword(password))
                    .Unset(u => u.ResetPasswordKey)
                    .Unset(u => u.ResetPasswordExpirationDate));
            if (user != null)
            {
                await LogInUserAsync(user);
                return true;
            }
            return false;
        }

        public async Task<bool> VerifyRecaptcha(string recaptchaResponse)
        {
            using (var client = new HttpClient())
            {
                var values = new Dictionary<string, string>
                {
                    { "secret", _captchaOptions.Value.CaptchaSecret },
                    { "response", recaptchaResponse },
                };
                var content = new FormUrlEncodedContent(values);

                HttpResponseMessage response = await client.PostAsync(VerificationUrl, content);

                string responseString = await response.Content.ReadAsStringAsync();

                var obj = JObject.Parse(responseString);
                return (bool)obj["success"];
            }
        }

        public async Task<string> SignUp(string name, string password, string email)
        {
            UserEntity existingUser = await _users.Query()
                .SingleOrDefaultAsync(u => u.CanonicalEmail == UserEntity.CanonicalizeEmail(email));
            if (existingUser != null)
            {
                if (!existingUser.Active && existingUser.Password == null)
                {
                    // invited user - activate, update and login user
                    existingUser = await _users
                        .UpdateAsync(u => u.CanonicalEmail == UserEntity.CanonicalizeEmail(email),
                            update => update.Set(u => u.EmailVerified, true)
                                .Set(u => u.Name, name)
                                .Set(u => u.Password, UserEntity.HashPassword(password))
                                .Set(u => u.Active, true));
                    if (existingUser != null)
                    {
                        await LogInUserAsync(existingUser);
                        return "success";
                    }
                }
                else if (existingUser.VerifyPassword(password))
                {
                    // TODO: check for sign up from other xForge sites
                }
            }
            else
            {
                var user = new UserEntity
                {
                    Name = name,
                    Email = email,
                    CanonicalEmail = UserEntity.CanonicalizeEmail(email),
                    EmailVerified = false,
                    Password = UserEntity.HashPassword(password),
                    Role = SystemRoles.User,
                    Active = true
                };

                if (await _users.InsertAsync(user))
                {
                    await LogInUserAsync(user);
                    await SendEmailVerificationLink(user.CanonicalEmail);
                    return "success";
                }
            }

            return "conflict";
        }

        public async Task<string> SendEmailVerificationLink(string email)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.CanonicalEmail == UserEntity.CanonicalizeEmail(email),
                update => update
                .Set(u => u.ValidationKey, Security.GenerateKey())
                .Set(u => u.ValidationExpirationDate, DateTime.UtcNow.AddDays(IdentityConstants.EmailVerificationPeriodDays))
            );
            SiteOptions siteOptions = _siteOptions.Value;
            string subject = $"{siteOptions.Name} - Email Verification";
            Uri url = new Uri(siteOptions.Origin,
                $"identity/verify-email?key={user.ValidationKey}");
            string body = "<div>"
                + $"<h1>Dear {user.Name},</h1>"
                + $"<p>Please click this link to verify your email <a href=\"{url}\" target=\"_blank\">"
                + "Confirm Verification</a>.</p>"
                + $"<p>Regards,<br>The {siteOptions.Name} Team</p>"
                + "</div>";

            await _emailService.SendEmailAsync(user.Email, subject, body);
            return "success";
        }

        public async Task<bool> VerifyInvitedUser(string email)
        {
            UserEntity existingUser = await _users.Query()
                .SingleOrDefaultAsync(u => u.CanonicalEmail == UserEntity.CanonicalizeEmail(email));
            if (existingUser != null && String.IsNullOrEmpty(existingUser.Name) &&
                String.IsNullOrEmpty(existingUser.Password) && !existingUser.Active)
            {
                return true;
            }
            return false;
        }

        public async Task<bool> VerifyEmail(string key)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.ValidationKey == key && u.ValidationExpirationDate > DateTime.UtcNow,
                update => update
                    .Set(u => u.EmailVerified, true)
                    .Unset(u => u.ValidationKey)
                    .Unset(u => u.ValidationExpirationDate));
            return user != null;
        }

        public async Task<bool> VerifyResetPasswordKey(string key)
        {
            UserEntity user = await _users.Query().SingleOrDefaultAsync(u => u.ResetPasswordKey == key
                && u.ResetPasswordExpirationDate > DateTime.UtcNow);
            return user != null;
        }

        public async Task<ExternalSignUpResult> ExternalSignUp()
        {
            (bool success, string returnUrl) = await _externalAuthService.SignUpAsync();
            return new ExternalSignUpResult { Success = success, ReturnUrl = returnUrl };
        }

        public async Task<LinkAccountResult> LinkAccount(string userIdentifier, string password)
        {
            Attempt<UserEntity> attempt = await _users.TryGetByIdentifier(userIdentifier);
            // validate username/password
            if (attempt.TryResult(out UserEntity user) && user.VerifyPassword(password))
            {
                string returnUrl = await _externalAuthService.LogInAsync(user.Id);
                return new LinkAccountResult { Success = true, ReturnUrl = returnUrl };
            }

            await _events.RaiseAsync(new UserLoginFailureEvent(userIdentifier, "invalid credentials"));
            return new LinkAccountResult { Success = false };
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
                    ExpiresUtc = DateTimeOffset.UtcNow.Add(IdentityConstants.RememberMeLogInDuration)
                };
            };
            // issue authentication cookie with subject ID and name
            await _httpContextAccessor.HttpContext.SignInAsync(user.Id, user.Name, props);
        }
    }
}
