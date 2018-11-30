using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.Services
{
    public static class CommonServiceCollectionExtensions
    {
        /**
         * Adds miscellaneous services that are common to all xForge applications to the DI container.
         */
        public static IServiceCollection AddCommonServices(this IServiceCollection services)
        {
            services.AddScoped<IUserAccessor, UserAccessor>();
            services.AddScoped<IHttpRequestAccessor, HttpRequestAccessor>();
            services.AddTransient<IEmailService, EmailService>();

            return services;
        }
    }
}
