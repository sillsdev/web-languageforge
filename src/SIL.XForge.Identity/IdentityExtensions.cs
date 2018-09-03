using System.Collections.Generic;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Identity.Services;

namespace SIL.XForge.Identity
{
    public static class IdentityExtensions
    {
        private static readonly List<IdentityResource> IdentityResources = new List<IdentityResource>
        {
            new IdentityResources.OpenId(),
            new IdentityResources.Email(),
            new IdentityResources.Profile()
        };

        private static readonly List<ApiResource> ApiResources = new List<ApiResource>
        {
            new ApiResource("api", "Web API")
            {
                UserClaims = { JwtClaimTypes.Role, "site_role" }
            }
        };

        private static readonly List<Client> Clients = new List<Client>
        {
            XForgeClient("SFDev", "beta.scriptureforge.local"),
            XForgeClient("SFStaging", "beta.qa.scripureforge.org"),
            XForgeClient("SFLive", "beta.scriptureforge.org")
        };

        private static Client XForgeClient(string id, string host)
        {
            return new Client
            {
                ClientId = id,
                AllowedGrantTypes = GrantTypes.Implicit,
                AllowAccessTokensViaBrowser = true,
                AlwaysIncludeUserClaimsInIdToken = true,
                AccessTokenType = AccessTokenType.Jwt,
                RequireConsent = false,
                RedirectUris =
                {
                    $"https://{host}/home",
                    $"https://{host}/silent-refresh.html"
                },
                PostLogoutRedirectUris =
                {
                    $"https://{host}/"
                },
                AllowedScopes =
                {
                    IdentityServerConstants.StandardScopes.OpenId,
                    IdentityServerConstants.StandardScopes.Email,
                    IdentityServerConstants.StandardScopes.Profile,
                    "api"
                }
            };
        }

        public static IServiceCollection AddXForgeIdentityServer(this IServiceCollection services)
        {
            services.ConfigureOptions<StaticFilesConfigureOptions>();

            services.AddIdentityServer()
                .AddValidationKeys()
                .AddDeveloperSigningCredential()
                .AddInMemoryIdentityResources(IdentityResources)
                .AddInMemoryApiResources(ApiResources)
                .AddInMemoryClients(Clients)
                .AddProfileService<UserProfileService>()
                .AddResourceOwnerValidator<UserResourceOwnerPasswordValidator>()
                .AddOperationalStore(options =>
                    {
                        options.ConnectionString = "mongodb://localhost:27017";
                        options.Database = "xforge";
                    });

            return services;
        }
    }
}
