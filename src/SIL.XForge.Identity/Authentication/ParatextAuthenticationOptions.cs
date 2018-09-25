using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;

namespace SIL.XForge.Identity.Authentication
{
    public class ParatextAuthenticationOptions : OAuthOptions
    {
        public ParatextAuthenticationOptions()
        {
            AuthorizationEndpoint = ParatextAuthenticationDefaults.AuthorizationEndpoint;
            UserInformationEndpoint = ParatextAuthenticationDefaults.UserInformationEndpoint;
            TokenEndpoint = ParatextAuthenticationDefaults.TokenEndpoint;
            CallbackPath = ParatextAuthenticationDefaults.CallbackPath;
            ClaimsIssuer = ParatextAuthenticationDefaults.Issuer;
            Scope.Add("openid");
            Scope.Add("email");

            ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "sub");
            ClaimActions.MapJsonKey(ClaimTypes.Name, "username");
            ClaimActions.MapJsonKey(ClaimTypes.PrimaryGroupSid, "primary_org_id");
            ClaimActions.MapJsonKey(ClaimTypes.Email, "email");
        }

        public void UseDevServer()
        {
            AuthorizationEndpoint = ParatextAuthenticationDefaults.DevAuthorizationEndpoint;
            UserInformationEndpoint = ParatextAuthenticationDefaults.DevUserInformationEndpoint;
            TokenEndpoint = ParatextAuthenticationDefaults.DevTokenEndpoint;
        }
    }
}
