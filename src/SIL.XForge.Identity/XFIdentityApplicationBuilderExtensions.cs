using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.FileProviders;

namespace SIL.XForge.Identity
{
    public static class XFIdentityApplicationBuilderExtensions
    {
        public static void UseXFIdentityServer(this IApplicationBuilder app)
        {
            app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new ManifestEmbeddedFileProvider(Assembly.GetExecutingAssembly(), "wwwroot")
                });

            app.UseIdentityServer();
        }
    }
}
