using System;
using System.Net.Http;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using JsonApiDotNetCore.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using SIL.XForge.Configuration;
using SIL.XForge.ExceptionLogging;
using SIL.XForge.Identity;
using SIL.XForge.Scripture.DataAccess;
using SIL.XForge.Scripture.Realtime;
using SIL.XForge.Scripture.Services;

namespace SIL.XForge.Scripture
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IHostingEnvironment env)
        {
            Configuration = configuration;
            Environment = env;
        }

        public IConfiguration Configuration { get; }
        public IHostingEnvironment Environment { get; }
        public IContainer ApplicationContainer { get; private set; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var containerBuilder = new ContainerBuilder();

            services.AddConfiguration(Configuration);

            services.AddRealtimeServer(Environment.IsDevelopment());

            services.AddExceptionLogging();

            services.AddXFIdentityServer(Configuration);

            var siteOptions = Configuration.GetOptions<SiteOptions>();
            services.AddAuthentication()
                .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
                    {
                        if (Environment.IsDevelopment())
                        {
                            options.BackchannelHttpHandler = new HttpClientHandler
                            {
                                ServerCertificateCustomValidationCallback
                                    = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                            };
                        }
                        options.Authority = $"https://{siteOptions.Domain}";
                        options.Audience = "api";
                    });

            services.AddSFDataAccess(Configuration);

            IMvcBuilder mvcBuilder = services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(o => o.SerializerSettings.NullValueHandling = NullValueHandling.Ignore);

            services.AddSFJsonApi(mvcBuilder, containerBuilder);

            // In production, the Angular files will be served from this directory
            services.AddSpaStaticFiles(configuration =>
                {
                    configuration.RootPath = "ClientApp/dist";
                });

            containerBuilder.Populate(services);

            ApplicationContainer = containerBuilder.Build();
            return new AutofacServiceProvider(ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime appLifetime)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
                {
                    ForwardedHeaders = ForwardedHeaders.All
                });

            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();

            app.UseBugsnag();

            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseIdentityServer();

            app.UseJsonApi();

            app.UseMvc(routes =>
                {
                    routes.MapRoute(
                        name: "default",
                        template: "{controller=Default}/{action=Index}/{id?}");
                });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    if (Configuration.GetValue<bool>("start-ng-serve", true))
                        spa.UseAngularCliServer(npmScript: "start");
                    else
                        spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                }
                else if (env.IsEnvironment("Testing"))
                {
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                }
            });

            app.UseRealtimeServer();

            appLifetime.ApplicationStopped.Register(() => ApplicationContainer.Dispose());
        }
    }
}
