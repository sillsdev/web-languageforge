using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Authentication;
using SIL.XForge.Models;

namespace SIL.XForge.Identity.Controllers
{
    [Route("identity")]
    [ApiController]
    public class IdentityController : ControllerBase
    {
        private readonly IRepository<UserEntity> _users;
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IEventService _events;

        public IdentityController(IIdentityServerInteractionService interaction, IEventService events,
            IRepository<UserEntity> users)
        {
            _users = users;
            _interaction = interaction;
            _events = events;
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
        /// initiate roundtrip to external authentication provider
        /// </summary>
        [HttpGet("challenge")]
        public IActionResult Challenge(string provider, bool rememberLogIn, string returnUrl, string userId)
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
                    { "scheme", provider },
                    { "rememberLogIn", rememberLogIn.ToString() }
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
            var rememberLogIn = bool.Parse(result.Properties.Items["rememberLogIn"]);
            if (rememberLogIn)
            {
                localSignInProps.IsPersistent = true;
                localSignInProps.ExpiresUtc = DateTimeOffset.UtcNow.Add(IdentityConstants.RememberMeLogInDuration);
            }

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
            await _events.RaiseAsync(new UserLoginSuccessEvent(provider, userIdClaim.Value, user.Id, user.Name));
            await HttpContext.SignInAsync(user.Id, user.Name, provider, localSignInProps,
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
    }
}
