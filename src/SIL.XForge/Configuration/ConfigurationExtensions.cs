using Microsoft.Extensions.Configuration;

namespace SIL.XForge.Configuration
{
    public static class ConfigurationExtensions
    {
        public static T GetOptions<T>(this IConfiguration configuration) where T : class, new()
        {
            string sectionName = Options.GetSectionName<T>();
            return configuration.GetSection(sectionName).Get<T>() ?? new T();
        }
    }
}
