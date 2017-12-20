using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Serialization;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Options;
using SIL.XForge.WebApi.Server.Services;
using System.Collections.Generic;
using System.Text;

namespace SIL.XForge.WebApi.Server
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

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var issuers = new List<string> { "languageforge.org", "scriptureforge.org", "cat.languageforge.org" };
            if (Environment.IsDevelopment())
            {
                issuers.Add("languageforge.local");
                issuers.Add("scriptureforge.local");
                issuers.Add("cat.languageforge.local");
            }
            IConfigurationSection securityConfig = Configuration.GetSection("Security");
            string jwtKey = securityConfig.GetValue<string>("JwtKey") ?? "this_is_not_a_secret_dev_only";
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuers = issuers,
                        ValidAudiences = issuers,
                        RequireExpirationTime = false,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey))
                    };
                });

            services.AddCors(options =>
            {
                options.AddPolicy("GlobalPolicy", policy => policy
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.AddMvc()
                .AddJsonOptions(a => a.SerializerSettings.ContractResolver
                    = new CamelCasePropertyNamesContractResolver());
            services.AddRouting(options => options.LowercaseUrls = true);

            services.Configure<ParatextOptions>(Configuration.GetSection("Paratext"));

            services.AddMongoDataAccess(Configuration);
            services.AddSingleton<SendReceiveService>();
            services.AddSingleton<ParatextService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();

            app.UseAuthentication();

            app.UseCors("GlobalPolicy");

            app.UseMvc();

            app.UseHangfireServer();
        }
    }
}
