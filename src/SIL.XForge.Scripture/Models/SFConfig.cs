using System.Collections.Generic;

namespace SIL.XForge.Scripture.Models
{
    public class SFConfig
    {
        public SFConfigDocType Source { get; set; } = new SFConfigDocType();
        public SFConfigDocType Target { get; set; } = new SFConfigDocType();
        public bool IsTranslationDataShared { get; set; }
        public bool IsTranslationDataScripture { get; set; }
        public SFConfigDocumentsSet DocumentSets { get; set; } = new SFConfigDocumentsSet();
        public double ConfidenceThreshold { get; set; } = 0.2;
        public Dictionary<string, SFUserPreferences> UsersPreferences { get; protected set; }
            = new Dictionary<string, SFUserPreferences>();
        public SFConfigMetrics Metrics { get; set; } = new SFConfigMetrics();
    }
}
