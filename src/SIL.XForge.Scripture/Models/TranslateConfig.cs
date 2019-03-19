using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class TranslateConfig : TaskConfig
    {
        public string SourceParatextId { get; set; }
        public InputSystem SourceInputSystem { get; set; } = new InputSystem();
    }
}
