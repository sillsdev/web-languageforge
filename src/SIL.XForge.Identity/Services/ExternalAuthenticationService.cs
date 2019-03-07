using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Events;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Authentication;
using SIL.XForge.Models;

namespace SIL.XForge.Identity.Services
{
    public class ExternalAuthenticationService : IExternalAuthenticationService
    {
        private readonly IRepository<UserEntity> _users;
        private readonly IEventService _events;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ExternalAuthenticationService(IEventService events, IRepository<UserEntity> users,
            IHttpContextAccessor httpContextAccessor)
        {
            _events = events;
            _users = users;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<string> LogInAsync(string userId = null)
        {
            (bool success, string returnUrl) = await HandleExternalAuthenticationAsync(create: false, userId: userId);
            Debug.Assert(success);
            return returnUrl;
        }

        public Task<(bool Success, string ReturnUrl)> SignUpAsync()
        {
            return HandleExternalAuthenticationAsync(create: true);
        }

        private async Task<(bool Success, string ReturnUrl)> HandleExternalAuthenticationAsync(bool create,
            string userId = null)
        {
            HttpContext httpContext = _httpContextAccessor.HttpContext;
            // read external identity from the temporary cookie
            AuthenticateResult result = await httpContext.AuthenticateAsync(
                IdentityServerConstants.ExternalCookieAuthenticationScheme);
            if (result?.Succeeded != true)
            {
                throw new Exception("External authentication error");
            }

            // lookup our user and external provider info
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
            UserEntity user;
            if (create)
            {
                user = await CreateUserFromExternalProviderAsync(externalUserId, email, name, result.Properties);
                if (user == null)
                    return (false, null);
            }
            else
            {
                user = await GetUserFromExternalProviderAsync(externalUserId, email, name, result.Properties, userId);
                if (user == null)
                    return (true, $"/identity/external-sign-up?name={name}&email={email}");
            }

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

            // try to determine the unique id of the external user (issued by the provider)
            // the most common claim type for that are the sub claim and the NameIdentifier
            // depending on the external provider, some other claim type might be used

            string provider = result.Properties.Items["scheme"];

            // issue authentication cookie for user
            await _events.RaiseAsync(new UserLoginSuccessEvent(provider, userIdClaim.Value, user.Id, user.Name));
            await httpContext.SignInAsync(user.Id, user.Name, provider, localSignInProps,
                additionalLocalClaims.ToArray());

            // delete temporary cookie used during external authentication
            await httpContext.SignOutAsync(IdentityServerConstants.ExternalCookieAuthenticationScheme);

            // retrieve return URL
            if (result.Properties.Items.TryGetValue("returnUrl", out string url))
                return (true, url);
            return (true, null);
        }

        private async Task<UserEntity> GetUserFromExternalProviderAsync(string externalUserId, string email,
            string name, AuthenticationProperties props, string userId)
        {
            UserEntity user;
            string provider = props.Items["scheme"];
            Expression<Func<UserEntity, bool>> predicate = null;
            if (userId != null || props.Items.TryGetValue("userId", out userId))
                predicate = u => u.Id == userId;
            switch (provider)
            {
                case ParatextAuthenticationDefaults.AuthenticationScheme:
                    if (predicate == null)
                        predicate = u => u.ParatextId == externalUserId || u.Email == email;
                    var paratextTokens = new Tokens
                    {
                        AccessToken = props.GetTokenValue("access_token"),
                        RefreshToken = props.GetTokenValue("refresh_token")
                    };
                    user = await _users.UpdateAsync(predicate, update => update
                        .Set(u => u.ParatextId, externalUserId)
                        .Set(u => u.ParatextTokens, paratextTokens));
                    break;
                default:
                    throw new Exception("Unknown external authentication scheme.");
            }

            return user;
        }

        private async Task<UserEntity> CreateUserFromExternalProviderAsync(string externalUserId, string email,
            string name, AuthenticationProperties props)
        {
            UserEntity user;
            string provider = props.Items["scheme"];
            switch (provider)
            {
                case ParatextAuthenticationDefaults.AuthenticationScheme:
                    var paratextTokens = new Tokens
                    {
                        AccessToken = props.GetTokenValue("access_token"),
                        RefreshToken = props.GetTokenValue("refresh_token")
                    };
                    user = new UserEntity
                    {
                        Name = name,
                        Email = email,
                        CanonicalEmail = UserEntity.CanonicalizeEmail(email),
                        EmailVerified = true,
                        Role = SystemRoles.User,
                        Active = true,
                        ParatextId = externalUserId,
                        ParatextTokens = paratextTokens
                    };
                    break;
                default:
                    throw new Exception("Unknown external authentication scheme.");
            }

            try
            {
                await _users.InsertAsync(user);
                return user;
            }
            catch (DuplicateKeyException)
            {
                return null;
            }
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
    }
}
