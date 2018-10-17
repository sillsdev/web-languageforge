using System;
using System.Net.Http;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using Hangfire;
using IdentityServer4;
using JsonApiDotNetCore.Extensions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using SIL.Extensions;
using SIL.XForge.Configuration;
using SIL.XForge.ExceptionLogging;
using SIL.XForge.Identity;
using SIL.XForge.Identity.Authentication;
using SIL.XForge.Scripture.Configuration;
using SIL.XForge.Scripture.DataAccess;
using SIL.XForge.Scripture.Realtime;
using SIL.XForge.Scripture.Services;
using SIL.XForge.Services;

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

            services.AddSFConfiguration(Configuration);

            services.AddRealtimeServer(Environment.IsDevelopment() || Environment.IsEnvironment("Testing"));

            services.AddExceptionLogging();

            services.AddXFIdentityServer(Configuration);

            var siteOptions = Configuration.GetOptions<SiteOptions>();
            var paratextOptions = Configuration.GetOptions<ParatextOptions>();
            services.AddAuthentication()
                .AddJwtBearer(options =>
                    {
                        if (Environment.IsDevelopment() || Environment.IsEnvironment("Testing"))
                        {
                            options.BackchannelHttpHandler = new HttpClientHandler
                            {
                                ServerCertificateCustomValidationCallback
                                    = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                            };
                        }
                        options.Authority = $"https://{siteOptions.Domain}";
                        options.Audience = "api";
                    })
                .AddParatext(options =>
                    {
                        options.SignInScheme = IdentityServerConstants.ExternalCookieAuthenticationScheme;
                        options.SaveTokens = true;

                        if (Environment.IsDevelopment() || Environment.IsEnvironment("Testing"))
                            options.UseDevServer();
                        options.ClientId = paratextOptions.ClientId;
                        options.ClientSecret = paratextOptions.ClientSecret;
                        options.Scope.AddRange(new[]
                            {
                                "projects:read",
                                "data_access",
                                "offline_access",
                                "projects.members:read",
                                "projects.members:write"
                            });
                    });

            services.AddSFDataAccess(Configuration);

            IMvcBuilder mvcBuilder = services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1)
                .AddJsonOptions(o => o.SerializerSettings.NullValueHandling = NullValueHandling.Ignore);

            services.AddSFJsonApi(mvcBuilder, containerBuilder);

            services.AddTransient<IEmailService, EmailService>();

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

            if (env.IsDevelopment() || env.IsEnvironment("Testing"))
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
                    if (Configuration.GetValue("start-ng-serve", true))
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

            app.UseHangfireServer();

            appLifetime.ApplicationStopped.Register(() => ApplicationContainer.Dispose());
        }
    }
}
