using System.Collections.Generic;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;

namespace SIL.XForge.Identity
{
    public class OpenIDConfig
    {
        public static IEnumerable<IdentityResource> GetIdentityResources()
        {
            return new List<IdentityResource>
            {
                new IdentityResources.OpenId(),
                new IdentityResources.Email(),
                new IdentityResources.Profile()
            };
        }

        public static IEnumerable<ApiResource> GetApiResources()
        {
            return new List<ApiResource>
            {
                new ApiResource("api", "Web API")
                {
                    UserClaims = { JwtClaimTypes.Role, "site_role" }
                }
            };
        }

        public static IEnumerable<Client> GetClients()
        {
            return new List<Client>
            {
                new Client
                {
                    ClientId = "SFDev",
                    AllowedGrantTypes = GrantTypes.Implicit,
                    AllowAccessTokensViaBrowser = true,
                    AlwaysIncludeUserClaimsInIdToken = true,
                    AccessTokenType = AccessTokenType.Jwt,
                    RequireConsent = false,
                    RedirectUris =
                    {
                        "https://scriptureforge.local/home",
                        "https://scriptureforge.local/silent-refresh.html",
                        "http://localhost:5000/home",
                        "http://localhost:5000/silent-refresh.html"
                    },
                    PostLogoutRedirectUris =
                    {
                        "https://scriptureforge.local/",
                        "http://localhost:5000/"
                    },
                    AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Email,
                        IdentityServerConstants.StandardScopes.Profile,
                        "api"
                    }
                }
            };
        }
    }
}
