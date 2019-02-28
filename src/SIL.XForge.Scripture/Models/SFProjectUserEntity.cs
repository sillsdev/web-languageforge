using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectUserEntity : ProjectUserEntity
    {
        public string SelectedTask { get; set; }
        public TranslateProjectUserConfig TranslateConfig { get; set; } = new TranslateProjectUserConfig();
    }
}
