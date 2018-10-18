using System.IO;
using System.Reflection;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace SIL.XForge.Scripture
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args)
        {
            IWebHostBuilder builder = WebHost.CreateDefaultBuilder(args);
            string environment = builder.GetSetting("environment");

            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("hosting.json", true, true)
                .AddJsonFile($"hosting.{environment}.json", true, true)
                .Build();

            return builder
                .UseLibuv()
                .UseUrls("http://localhost:5000")
                .ConfigureAppConfiguration((context, config) =>
                    {
                        IHostingEnvironment env = context.HostingEnvironment;
                        if (env.IsDevelopment() || env.IsEnvironment("Testing"))
                            config.AddJsonFile("appsettings.user.json", true);
                        else
                            config.AddJsonFile("secrets.json", true, true);
                        if (env.IsEnvironment("Testing"))
                        {
                            var appAssembly = Assembly.Load(new AssemblyName(env.ApplicationName));
                            if (appAssembly != null)
                                config.AddUserSecrets(appAssembly, true);
                        }
                    })
                .UseConfiguration(configuration)
                .UseStartup<Startup>();
        }
    }
}
