using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Configuration;
using SIL.XForge.Identity.Configuration;
using SIL.XForge.Identity.Services;

namespace SIL.XForge.Identity
{
    public static class XFIdentityServiceCollectionExtensions
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
                UserClaims = { JwtClaimTypes.Role }
            }
        };

        private static Client XFClient(Uri origin)
        {
            return new Client
            {
                ClientId = "xForge",
                AllowedGrantTypes = GrantTypes.Implicit,
                AllowAccessTokensViaBrowser = true,
                AlwaysIncludeUserClaimsInIdToken = true,
                AccessTokenType = AccessTokenType.Jwt,
                RequireConsent = false,
                RedirectUris =
                {
                    BuildUrl(origin, "home"),
                    BuildUrl(origin, "silent-refresh.html")
                },
                PostLogoutRedirectUris =
                {
                    origin.ToString()
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

        private static string BuildUrl(Uri baseUri, string relativeUri)
        {
            var result = new Uri(baseUri, relativeUri);
            return result.ToString();
        }

        public static IServiceCollection AddXFIdentityServer(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddOptions<GoogleCaptchaOptions>(configuration);

            var siteOptions = configuration.GetOptions<SiteOptions>();

            var dataAccessOptions = configuration.GetOptions<DataAccessOptions>();

            IIdentityServerBuilder builder = services.AddIdentityServer(options =>
                {
                    options.UserInteraction.LoginUrl = "/identity/log-in";
                    options.UserInteraction.LogoutUrl = "/identity/log-out";
                    options.UserInteraction.LogoutIdParameter = "logOutId";
                })
                .AddValidationKeys()
                .AddInMemoryIdentityResources(IdentityResources)
                .AddInMemoryApiResources(ApiResources)
                .AddInMemoryClients(new[] { XFClient(siteOptions.Origin) })
                .AddProfileService<UserProfileService>()
                .AddResourceOwnerValidator<UserResourceOwnerPasswordValidator>()
                .AddOperationalStore(options =>
                    {
                        options.ConnectionString = dataAccessOptions.ConnectionString;
                        options.Database = dataAccessOptions.MongoDatabaseName;
                    });

            var securityOptions = configuration.GetOptions<SecurityOptions>();
            if (securityOptions.UseDeveloperSigningCredential)
            {
                builder.AddDeveloperSigningCredential();
            }
            else
            {
                var cert = new X509Certificate2(securityOptions.SigningCredential);
                builder.AddSigningCredential(cert);
            }

            return services;
        }
    }
}
