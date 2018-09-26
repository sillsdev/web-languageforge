using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class TranslateConfig : TaskConfig
    {
        public string SourceParatextId { get; set; }
        public InputSystem SourceInputSystem { get; set; } = new InputSystem();

        public bool IsTranslationDataShared { get; set; }
        public double ConfidenceThreshold { get; set; } = 0.2;
        public TranslateMetrics Metrics { get; set; } = new TranslateMetrics();
    }
}
