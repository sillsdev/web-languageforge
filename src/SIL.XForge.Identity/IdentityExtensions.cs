using Microsoft.Extensions.DependencyInjection;
using SIL.XForge.Identity.Services;

namespace SIL.XForge.Identity
{
    public static class IdentityExtensions
    {
        public static IServiceCollection AddXForgeIdentity(this IServiceCollection services)
        {
            services.ConfigureOptions<StaticFilesConfigureOptions>();

            services.AddIdentityServer()
                .AddValidationKeys()
                .AddDeveloperSigningCredential()
                .AddInMemoryIdentityResources(OpenIDConfig.GetIdentityResources())
                .AddInMemoryApiResources(OpenIDConfig.GetApiResources())
                .AddInMemoryClients(OpenIDConfig.GetClients())
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
