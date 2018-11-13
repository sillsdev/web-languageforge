// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0.
// Modifications copyright 2018 SIL International and licensed under a different license.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Services;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using System.Security.Cryptography;
using System.Text;
using SIL.XForge.Identity.Configuration;

namespace SIL.XForge.Identity.Controllers.Account
{
    /// <summary>
    /// This sample controller implements a typical login/logout/provision workflow for local and external accounts.
    /// The login service encapsulates the interactions with the user data store. This data store is in-memory only and cannot be used for production!
    /// The interaction service provides a way for the UI to communicate with identityserver for validation and context retrieval
    /// </summary>
    [SecurityHeaders]
    [AllowAnonymous]
    public class AccountController : Controller
    {
        private const int PasswordResetPeriodDays = 7;
        private readonly GoogleCaptchaOptions _captcha;
        private readonly IRepository<UserEntity> _users;
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IClientStore _clientStore;
        private readonly IAuthenticationSchemeProvider _schemeProvider;
        private readonly IEventService _events;
        private readonly IOptions<SiteOptions> _options;
        private readonly IEmailService _emailService;
        public AccountController(
            IIdentityServerInteractionService interaction,
            IClientStore clientStore,
            IAuthenticationSchemeProvider schemeProvider,
            IEventService events,
            IRepository<UserEntity> users,
            IOptions<SiteOptions> options,
            IEmailService emailService,
            IOptions<GoogleCaptchaOptions> captcha)
        {
            _users = users;
            _interaction = interaction;
            _clientStore = clientStore;
            _schemeProvider = schemeProvider;
            _events = events;
            _options = options;
            _emailService = emailService;
            _captcha = captcha.Value;
        }

        private const string ShowMessageKey = "showMessage";

        private static string GenerateValidationKey()
        {
            char[] chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();
            byte[] data = new byte[1];
            using (RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider())
            {
                crypto.GetNonZeroBytes(data);
                data = new byte[16];
                crypto.GetNonZeroBytes(data);
            }
            StringBuilder key = new StringBuilder(16);
            foreach (byte b in data)
            {
                key.Append(chars[b % (chars.Length)]);
            }
            return key.ToString();
        }

        /// <summary>
        /// Entry point into the login workflow
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Login(string returnUrl)
        {
            // build a model so we know what to show on the login page
            LoginViewModel vm = await BuildLoginViewModelAsync(returnUrl);

            if (vm.IsExternalLoginOnly)
            {
                // we only have one option for logging in and it's an external provider
                return RedirectToAction("Challenge", "External", new { provider = vm.ExternalLoginScheme, returnUrl });
            }
            if (TempData[ShowMessageKey] != null)
            {
                vm.ShowMessage = TempData[ShowMessageKey].ToString();
                TempData[ShowMessageKey] = null;
            }

            return View(vm);
        }

        /// <summary>
        /// Handle postback from username/password login
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginInputModel model, string button)
        {
            // check if we are in the context of an authorization request
            AuthorizationRequest context = await _interaction.GetAuthorizationContextAsync(model.ReturnUrl);

            // the user clicked the "cancel" button
            if (button != "login")
            {
                if (context != null)
                {
                    // if the user cancels, send a result back into IdentityServer as if they
                    // denied the consent (even if this client does not require consent).
                    // this will send back an access denied OIDC error response to the client.
                    await _interaction.GrantConsentAsync(context, ConsentResponse.Denied);

                    // we can trust model.ReturnUrl since GetAuthorizationContextAsync returned non-null
                    if (await _clientStore.IsPkceClientAsync(context.ClientId))
                    {
                        // if the client is PKCE then we assume it's native, so this change in how to
                        // return the response is for better UX for the end user.
                        return View("Redirect", new RedirectViewModel { RedirectUrl = model.ReturnUrl });
                    }

                    return Redirect(model.ReturnUrl);
                }
                else
                {
                    // since we don't have a valid context, then we just go back to the home page
                    return Redirect("~/");
                }
            }

            if (ModelState.IsValid)
            {
                UserEntity user = await _users.Query().SingleOrDefaultAsync(u => u.Username == model.EmailOrUsername
                    || u.CanonicalEmail == UserEntity.CanonicalizeEmail(model.EmailOrUsername));
                // validate username/password against in-memory store
                if (user != null && user.VerifyPassword(model.Password))
                {
                    await _events.RaiseAsync(new UserLoginSuccessEvent(user.Username, user.Id, user.Username));

                    // the user's password is not forgotten, so invalidate any password reset link.
                    await _users.UpdateAsync(user, update => update.Unset(u => u.ResetPasswordExpirationDate));

                    // only set explicit expiration here if user chooses "remember me".
                    // otherwise we rely upon expiration configured in cookie middleware.
                    AuthenticationProperties props = null;
                    if (AccountOptions.AllowRememberLogin && model.RememberLogin)
                    {
                        props = new AuthenticationProperties
                        {
                            IsPersistent = true,
                            ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration)
                        };
                    }

                    // issue authentication cookie with subject ID and username
                    await HttpContext.SignInAsync(user.Id, user.Username, props);

                    if (context != null)
                    {
                        if (await _clientStore.IsPkceClientAsync(context.ClientId))
                        {
                            // if the client is PKCE then we assume it's native, so this change in how to
                            // return the response is for better UX for the end user.
                            return View("Redirect", new RedirectViewModel { RedirectUrl = model.ReturnUrl });
                        }

                        // we can trust model.ReturnUrl since GetAuthorizationContextAsync returned non-null
                        return Redirect(model.ReturnUrl);
                    }

                    // request for a local page
                    if (Url.IsLocalUrl(model.ReturnUrl))
                    {
                        return Redirect(model.ReturnUrl);
                    }
                    else if (string.IsNullOrEmpty(model.ReturnUrl))
                    {
                        return Redirect("~/");
                    }
                    else
                    {
                        // user might have clicked on a malicious link - should be logged
                        throw new Exception("invalid return URL");
                    }
                }

                await _events.RaiseAsync(new UserLoginFailureEvent(model.EmailOrUsername, "invalid credentials"));
                ModelState.AddModelError("", AccountOptions.InvalidCredentialsErrorMessage);
            }

            // something went wrong, show form with error
            LoginViewModel vm = await BuildLoginViewModelAsync(model);
            return View(vm);
        }

        /// <summary>
        /// Show forgot password page
        /// </summary>
        [HttpGet]
        public IActionResult ForgotPassword()
        {
            ForgotPasswordViewModel vm = BuildForgotPasswordViewModel();
            return View("ForgotPassword", vm);
        }

        /// <summary>
        /// Validate username or email and send email
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
        {
            UserEntity user = await _users.UpdateAsync(
                u => u.Username == model.EmailOrUsername
                    || u.CanonicalEmail == UserEntity.CanonicalizeEmail(model.EmailOrUsername),
                update => update
                    .Set(u => u.ResetPasswordKey, GenerateValidationKey())
                    .Set(u => u.ResetPasswordExpirationDate, DateTime.UtcNow.AddDays(PasswordResetPeriodDays)));
            if (user != null)
            {
                SiteOptions siteOptions = _options.Value;
                var subject = $"{siteOptions.Name} Forgotten Password Verification";
                Uri url = new Uri(siteOptions.Origin, $"account/resetpassword?token={user.ResetPasswordKey}");
                var body = "<div class=''>"
                    + $"<h1>Reset Password for {user.Name}</h1>"
                    + $"<p>Please click this link to <a href='{url}' target='_blank'>Reset Your Password</a>.</p>"
                    + "<p>This link will be valid for 1 week.</p>"
                    + $"<p>Regards,<br>The {siteOptions.Name} team</p>"
                    + "</div>";

                await _emailService.SendEmailAsync(user.Email, subject, body);

                TempData[ShowMessageKey] = "Password reset email sent.";
                return RedirectToAction("Login", "Account");
            }
            else
            {
                model.EnableErrorMessage = true;
                return View("ForgotPassword", model);
            }
        }

        /// <summary>
        /// Validate the token produced by ForgotPassword; allow the user to reset the password
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> ResetPassword(string token)
        {
            var userEntity = await _users.Query().SingleOrDefaultAsync(u => u.ResetPasswordKey == token);
            if (userEntity != null && userEntity.ResetPasswordExpirationDate > DateTime.UtcNow)
            {
                var vm = BuildResetPasswordViewModel(userEntity);
                return View("ResetPassword", vm);
            }

            TempData[ShowMessageKey] = "The password reset request has expired. Please request another reset.";
            return RedirectToAction("Login", "Account");
        }

        /// <remarks>REVIEW (Hasso) 2018.10: would it be possible for an attacker of moderate intelligence to
        /// post such a request without first clicking the generated reset link?</remarks>
        [HttpPost]
        public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (model.Password != model.ConfirmPassword)
            {
                ModelState.AddModelError(string.Empty, "Both Passwords do not match");
                return View(model);
            }
            var updatedUserEntity = await _users.UpdateAsync(u => u.ResetPasswordKey == model.ResetToken
                                                               && u.ResetPasswordExpirationDate > DateTime.UtcNow,
                update => update
                    .Set(u => u.Password, BCrypt.Net.BCrypt.HashPassword(model.Password, 7))
                    .Unset(u => u.ResetPasswordExpirationDate));
            TempData[ShowMessageKey] = updatedUserEntity != null
                ? "Your password has been reset. Please login." // valid request
                : "The server had difficulty processing your request. Please try again."; // invalid request; play dumb.
            return RedirectToAction("Login", "Account");
        }

        private static ResetPasswordViewModel BuildResetPasswordViewModel(UserEntity user)
        {
            return new ResetPasswordViewModel
            {
                Password = "",
                ConfirmPassword = "",
                ResetToken = user.ResetPasswordKey
            };
        }

        /// <summary>
        /// Show logout page
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Logout(string logoutId)
        {
            // build a model so the logout page knows what to display
            LogoutViewModel vm = await BuildLogoutViewModelAsync(logoutId);

            if (vm.ShowLogoutPrompt == false)
            {
                // if the request for logout was properly authenticated from IdentityServer, then
                // we don't need to show the prompt and can just log the user out directly.
                return await Logout(vm);
            }

            return View(vm);
        }

        /// <summary>
        /// Handle logout page postback
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout(LogoutInputModel model)
        {
            // build a model so the logged out page knows what to display
            LoggedOutViewModel vm = await BuildLoggedOutViewModelAsync(model.LogoutId);

            if (User?.Identity.IsAuthenticated == true)
            {
                // delete local authentication cookie
                await HttpContext.SignOutAsync();

                // raise the logout event
                await _events.RaiseAsync(new UserLogoutSuccessEvent(User.GetSubjectId(), User.GetDisplayName()));
            }

            // check if we need to trigger sign-out at an upstream identity provider
            if (vm.TriggerExternalSignout)
            {
                // build a return URL so the upstream provider will redirect back
                // to us after the user has logged out. this allows us to then
                // complete our single sign-out processing.
                string url = Url.Action("Logout", new { logoutId = vm.LogoutId });

                // this triggers a redirect to the external provider for sign-out
                return SignOut(new AuthenticationProperties { RedirectUri = url }, vm.ExternalAuthenticationScheme);
            }

            return View("LoggedOut", vm);
        }

        [HttpGet("Account/Register")]
        [AllowAnonymous]
        public IActionResult Register()
        {
            ViewData["ReCaptchaKey"] = _captcha.CaptchaId;
            return View();
        }

        [HttpPost]
        [TypeFilter(typeof(ValidateRecaptchaFilter))]
        public async Task<ActionResult> Register(RegisterViewModel model, string returnUrl = null)
        {
            ViewData["ReCaptchaKey"] = _captcha.CaptchaId;
            ViewData["ReturnUrl"] = returnUrl;
            if (ModelState.IsValid)
            {
                bool emailExists = await _users.Query().AnyAsync(u => u.Email.ToLowerInvariant() == model.Email.ToLowerInvariant());
                if (emailExists)
                {
                    ModelState.AddModelError(string.Empty,
                        "A user with the specified email address already exists. Please use a different email address.");
                    return View(model);
                }

                var user = new UserEntity
                {
                    Name = model.Fullname,
                    Email = model.Email,
                    CanonicalEmail = UserEntity.CanonicalizeEmail(model.Email),
                    EmailVerified = false,
                    Password = BCrypt.Net.BCrypt.HashPassword(model.Password, 7),
                    Role = SystemRoles.User,
                    ValidationKey = GenerateValidationKey(),
                    ValidationExpirationDate = DateTime.UtcNow.AddDays(7),
                    Active = true
                };

                var result = await _users.InsertAsync(user);
                if (result)
                {
                    SiteOptions siteOptions = _options.Value;
                    string subject = $"{siteOptions.Name} - Email Verification";
                    Uri url = new Uri(siteOptions.Origin,
                        $"account/VerifyEmail?email={user.Email}&key={user.ValidationKey}");
                    string body = "<div class=''>"
                        + $"<h1>Dear {user.Name},</h1>"
                        + $"<p>Please click this link to activate your account <a href='{url}' target='_blank'>Confirm Verification</a>.</p>"
                        + $"<p>Regards,<br>The {siteOptions.Name} Team</p>"
                        + "</div>";

                    await _emailService.SendEmailAsync(user.Email, subject, body);
                    ModelState.Clear();
                    return Redirect("~/account/login");
                }
                else
                {
                    return View();
                }
            }
            // If we got this far, something failed, redisplay form
            return View(model);
        }

        [HttpGet("Account/VerifyEmail")]
        public async Task<ActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string key)
        {
            await _users.UpdateAsync(u => u.Email == email && u.ValidationKey == key,
                update => update.Set(u => u.EmailVerified, true));
            return View("VerifyEmail");
        }

        /*****************************************/
        /* helper APIs for the AccountController */
        /*****************************************/
        private async Task<LoginViewModel> BuildLoginViewModelAsync(string returnUrl)
        {
            AuthorizationRequest context = await _interaction.GetAuthorizationContextAsync(returnUrl);
            if (context?.IdP != null)
            {
                // this is meant to short circuit the UI and only trigger the one external IdP
                return new LoginViewModel
                {
                    EnableLocalLogin = false,
                    ReturnUrl = returnUrl,
                    EmailOrUsername = context.LoginHint,
                    ExternalProviders = new[] { new ExternalProvider { AuthenticationScheme = context.IdP } },
                    ShowMessage = ""
                };
            }

            IEnumerable<AuthenticationScheme> schemes = await _schemeProvider.GetAllSchemesAsync();

            var providers = schemes
                .Where(x => x.DisplayName != null)
                .Select(x => new ExternalProvider
                {
                    DisplayName = x.DisplayName,
                    AuthenticationScheme = x.Name
                }).ToList();

            var allowLocal = true;
            if (context?.ClientId != null)
            {
                Client client = await _clientStore.FindEnabledClientByIdAsync(context.ClientId);
                if (client != null)
                {
                    allowLocal = client.EnableLocalLogin;

                    if (client.IdentityProviderRestrictions != null && client.IdentityProviderRestrictions.Any())
                    {
                        providers = providers.Where(provider => client.IdentityProviderRestrictions.Contains(provider.AuthenticationScheme)).ToList();
                    }
                }
            }

            return new LoginViewModel
            {
                AllowRememberLogin = AccountOptions.AllowRememberLogin,
                EnableLocalLogin = allowLocal && AccountOptions.AllowLocalLogin,
                ReturnUrl = returnUrl,
                EmailOrUsername = context?.LoginHint,
                ExternalProviders = providers.ToArray(),
                ShowMessage = ""
            };
        }

        private async Task<LoginViewModel> BuildLoginViewModelAsync(LoginInputModel model)
        {
            LoginViewModel vm = await BuildLoginViewModelAsync(model.ReturnUrl);
            vm.EmailOrUsername = model.EmailOrUsername;
            vm.RememberLogin = model.RememberLogin;
            return vm;
        }

        private ForgotPasswordViewModel BuildForgotPasswordViewModel()
        {
            return new ForgotPasswordViewModel
            {
                EmailOrUsername = "",
                EnableErrorMessage = false
            };
        }

        private async Task<LogoutViewModel> BuildLogoutViewModelAsync(string logoutId)
        {
            var vm = new LogoutViewModel { LogoutId = logoutId, ShowLogoutPrompt = AccountOptions.ShowLogoutPrompt };

            if (User?.Identity.IsAuthenticated != true)
            {
                // if the user is not authenticated, then just show logged out page
                vm.ShowLogoutPrompt = false;
                return vm;
            }

            LogoutRequest context = await _interaction.GetLogoutContextAsync(logoutId);
            if (context?.ShowSignoutPrompt == false)
            {
                // it's safe to automatically sign-out
                vm.ShowLogoutPrompt = false;
                return vm;
            }

            // show the logout prompt. this prevents attacks where the user
            // is automatically signed out by another malicious web page.
            return vm;
        }

        private async Task<LoggedOutViewModel> BuildLoggedOutViewModelAsync(string logoutId)
        {
            // get context information (client name, post logout redirect URI and iframe for federated signout)
            LogoutRequest logout = await _interaction.GetLogoutContextAsync(logoutId);

            var vm = new LoggedOutViewModel
            {
                AutomaticRedirectAfterSignOut = AccountOptions.AutomaticRedirectAfterSignOut,
                PostLogoutRedirectUri = logout?.PostLogoutRedirectUri,
                ClientName = string.IsNullOrEmpty(logout?.ClientName) ? logout?.ClientId : logout?.ClientName,
                SignOutIframeUrl = logout?.SignOutIFrameUrl,
                LogoutId = logoutId
            };

            if (User?.Identity.IsAuthenticated == true)
            {
                string idp = User.FindFirst(JwtClaimTypes.IdentityProvider)?.Value;
                if (idp != null && idp != IdentityServer4.IdentityServerConstants.LocalIdentityProvider)
                {
                    bool providerSupportsSignout = await HttpContext.GetSchemeSupportsSignOutAsync(idp);
                    if (providerSupportsSignout)
                    {
                        if (vm.LogoutId == null)
                        {
                            // if there's no current logout context, we need to create one
                            // this captures necessary info from the current logged in user
                            // before we signout and redirect away to the external IdP for signout
                            vm.LogoutId = await _interaction.CreateLogoutContextAsync();
                        }

                        vm.ExternalAuthenticationScheme = idp;
                    }
                }
            }

            return vm;
        }
    }
}
