using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.DataAccess;
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

        private static Client XForgeClient(string host)
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

        public static IServiceCollection AddXForgeIdentityServer(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.ConfigureOptions<StaticFilesConfigureOptions>();

            IConfigurationSection systemConfig = configuration.GetSection("System");
            string host = systemConfig.GetValue<string>("Hostname");

            IConfigurationSection dataAccessConfig = configuration.GetSection("DataAccess");
            string connectionString = systemConfig.GetValue("ConnectionString",
                "mongodb://localhost:27017");

            IIdentityServerBuilder builder = services.AddIdentityServer()
                .AddValidationKeys()
                .AddInMemoryIdentityResources(IdentityResources)
                .AddInMemoryApiResources(ApiResources)
                .AddInMemoryClients(new[] { XForgeClient(host) })
                .AddProfileService<UserProfileService>()
                .AddResourceOwnerValidator<UserResourceOwnerPasswordValidator>()
                .AddOperationalStore(options =>
                    {
                        options.ConnectionString = connectionString;
                        options.Database = DataAccessConstants.MongoDatabase;
                    });

            IConfigurationSection securityConfig = configuration.GetSection("Security");
            bool useDeveloperCredential = securityConfig.GetValue("UseDeveloperSigningCredential", false);
            string certFileName = securityConfig.GetValue<string>("SigningCredential");
            if (useDeveloperCredential)
            {
                builder.AddDeveloperSigningCredential();
            }
            else
            {
                var cert = new X509Certificate2(certFileName);
                builder.AddSigningCredential(cert);
            }

            return services;
        }
    }
}
