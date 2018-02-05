using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.PlatformAbstractions;
using Swashbuckle.AspNetCore.Swagger;
using System.IO;

namespace SIL.XForge.WebApi.Server.Documentation
{
    public static class DocumentationExtensions
    {
        public static IServiceCollection AddDocumentationGen(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new Info
                {
                    Title = "xForge REST API",
                    Version = "v1"
                });
                c.AddSecurityDefinition("bearer", new ApiKeyScheme
                {
                    Description = "JWT Bearer Authorization. Enter: \"Bearer {token}\"",
                    Name = "Authorization",
                    In = "header",
                    Type = "apiKey"
                });
                string docPath = Path.Combine(PlatformServices.Default.Application.ApplicationBasePath,
                    "SIL.XForge.WebApi.Server.xml");
                c.IncludeXmlComments(docPath);
                c.OperationFilter<FormFileOperationFilter>();
                c.OperationFilter<RequiredParameterOperationFilter>();
                c.OperationFilter<AuthOperationFilter>();
            });
            return services;
        }

        public static IApplicationBuilder UseDocumentation(this IApplicationBuilder app)
        {
            app.UseSwagger(c =>
            {
                c.RouteTemplate = "docs/rest-{documentName}.json";
                c.PreSerializeFilters.Add((doc, req) => doc.BasePath = "/api2");
            });
            app.UseSwaggerUI3(c =>
            {
                c.RoutePrefix = "docs";
                c.SwaggerEndpoint("/api2/docs/rest-v1.json", "xForge REST API");
                c.ValidatorUrl(null);
            });
            return app;
        }
    }
}
