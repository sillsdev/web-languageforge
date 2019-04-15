using SIL.XForge.Services;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class CommonServiceCollectionExtensions
    {
        /// <summary>
        /// Adds miscellaneous services that are common to all xForge applications to the DI container.
        /// </summary>
        public static IServiceCollection AddCommonServices(this IServiceCollection services)
        {
            services.AddScoped<IUserAccessor, UserAccessor>();
            services.AddScoped<IHttpRequestAccessor, HttpRequestAccessor>();
            services.AddTransient<IEmailService, EmailService>();
            services.AddTransient<IFileSystemService, FileSystemService>();
            return services;
        }
    }
}
