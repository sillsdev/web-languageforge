using System.IO;
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
            IConfigurationRoot configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("hosting.json", true, true)
                .Build();

            return WebHost.CreateDefaultBuilder(args)
                .UseLibuv()
                .UseUrls("http://localhost:5000")
                .ConfigureAppConfiguration((context, config) => config.AddJsonFile("appsettings.user.json", true))
                .UseConfiguration(configuration)
                .UseStartup<Startup>();
        }
    }
}
