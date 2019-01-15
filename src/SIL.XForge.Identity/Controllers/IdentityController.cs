using System;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SIL.XForge.Identity.Services;

namespace SIL.XForge.Identity.Controllers
{
    [Route("identity")]
    [ApiController]
    public class IdentityController : ControllerBase
    {
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IEventService _events;
        private readonly IExternalAuthenticationService _externalAuthService;

        public IdentityController(IIdentityServerInteractionService interaction, IEventService events,
            IExternalAuthenticationService externalAuthService)
        {
            _interaction = interaction;
            _events = events;
            _externalAuthService = externalAuthService;
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
            // validate returnUrl - either it is a valid OIDC URL or back to a local page
            if (returnUrl != null && Url.IsLocalUrl(returnUrl) == false
                && _interaction.IsValidReturnUrl(returnUrl) == false)
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
                    { "scheme", provider },
                    { "rememberLogIn", rememberLogIn.ToString() }
                }
            };
            if (!string.IsNullOrEmpty(returnUrl))
                props.Items["returnUrl"] = returnUrl;
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
            string url = await _externalAuthService.LogInAsync();
            return Redirect(url ?? "~/");
        }
    }
}
