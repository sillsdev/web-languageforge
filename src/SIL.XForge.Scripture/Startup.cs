using System;
using System.IO;
using System.Net.Http;
using Autofac;
using Autofac.Extensions.DependencyInjection;
using JsonApiDotNetCore.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SpaServices.AngularCli;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.Scripture.Services;

namespace SIL.XForge.Scripture
{
    public enum SpaDevServerStartup
    {
        None,
        Start,
        Listen
    }

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

        private SpaDevServerStartup SpaDevServerStartup
        {
            get
            {
                if (Environment.IsDevelopment())
                {
                    string startNgServe = Configuration.GetValue("start-ng-serve", "yes");
                    switch (startNgServe)
                    {
                        case "yes":
                            return SpaDevServerStartup.Start;
                        case "listen":
                            return SpaDevServerStartup.Listen;
                    }
                }
                else if (Environment.IsEnvironment("Testing"))
                {
                    return SpaDevServerStartup.Listen;
                }
                return SpaDevServerStartup.None;
            }
        }

        private bool IsDevelopment => Environment.IsDevelopment() || Environment.IsEnvironment("Testing");

        // This method gets called by the runtime. Use this method to add services to the container.
        public IServiceProvider ConfigureServices(IServiceCollection services)
        {
            var containerBuilder = new ContainerBuilder();

            services.AddConfiguration(Configuration);

            services.AddSFRealtimeServer(IsDevelopment);

            services.AddExceptionLogging();

            services.AddCommonServices();

            services.AddXFIdentityServer(Configuration, IsDevelopment);

            var siteOptions = Configuration.GetOptions<SiteOptions>();
            services.AddAuthentication()
                .AddJwtBearer(options =>
                {
                    if (IsDevelopment)
                    {
                        options.RequireHttpsMetadata = false;
                        options.BackchannelHttpHandler = new HttpClientHandler
                        {
                            ServerCertificateCustomValidationCallback
                                = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                        };
                    }
                    options.Authority = siteOptions.Origin.ToString();
                    options.Audience = "api";
                });

            services.AddSFDataAccess(Configuration);

            IMvcBuilder mvcBuilder = services.AddMvc()
                .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

            services.AddSFJsonApi(mvcBuilder, containerBuilder, Configuration);

            services.AddXFJsonRpc();

            if (SpaDevServerStartup == SpaDevServerStartup.None)
            {
                // In production, the Angular files will be served from this directory
                services.AddSpaStaticFiles(configuration =>
                {
                    configuration.RootPath = "ClientApp/dist";
                });
            }

            services.AddMachine(config =>
                {
                    config.AuthenticationSchemes = new[] { JwtBearerDefaults.AuthenticationScheme };
                })
                .AddEngineOptions(o => o.EnginesDir = Path.Combine(siteOptions.SiteDir, "engines"))
                .AddMongoDataAccess(o => o.MachineDatabaseName = "xforge_machine")
                .AddTextCorpus<SFTextCorpusFactory>();
            services.AddSingleton<IAuthorizationHandler, MachineAuthorizationHandler>();

            containerBuilder.Populate(services);

            ApplicationContainer = containerBuilder.Build();
            return new AutofacServiceProvider(ApplicationContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IApplicationLifetime appLifetime)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.All
            });

            if (IsDevelopment)
                app.UseDeveloperExceptionPage();

            app.UseExceptionLogging();

            app.UseStaticFiles(new StaticFileOptions
            {
                // this will allow files without extensions to be served, which is necessary for LetsEncrypt
                ServeUnknownFileTypes = true
            });
            IOptions<SiteOptions> siteOptions = app.ApplicationServices.GetService<IOptions<SiteOptions>>();
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(Path.Combine(siteOptions.Value.SharedDir, "avatars")),
                RequestPath = "/assets/avatars"
            });

            if (SpaDevServerStartup == SpaDevServerStartup.None)
                app.UseSpaStaticFiles();

            app.UseXFIdentityServer();

            app.UseJsonApi();

            app.UseXFJsonRpc();

            app.UseMvc(routes =>
            {
                routes.MapRoute(name: "default", template: "{controller=Default}/{action=Index}/{id?}");
            });

            app.UseSpa(spa =>
            {
                // To learn more about options for serving an Angular SPA from ASP.NET Core,
                // see https://go.microsoft.com/fwlink/?linkid=864501
                spa.Options.SourcePath = "ClientApp";

                switch (SpaDevServerStartup)
                {
                    case SpaDevServerStartup.Start:
                        spa.UseAngularCliServer(npmScript: "start");
                        break;

                    case SpaDevServerStartup.Listen:
                        spa.UseProxyToSpaDevelopmentServer("http://localhost:4200");
                        break;
                }
            });

            app.UseRealtimeServer();

            app.UseMachine();

            app.UseSFDataAccess();

            appLifetime.ApplicationStopped.Register(() => ApplicationContainer.Dispose());
        }
    }
}
