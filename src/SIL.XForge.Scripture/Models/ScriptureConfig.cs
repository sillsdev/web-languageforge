using System.Collections.Generic;

namespace SIL.XForge.Scripture.Models
{
    public class ScriptureConfig
    {
        public ScriptureConfigDocType Source { get; set; } = new ScriptureConfigDocType();
        public ScriptureConfigDocType Target { get; set; } = new ScriptureConfigDocType();
        public bool IsTranslationDataShared { get; set; }
        public bool IsTranslationDataScripture { get; set; }
        public ScriptureConfigDocumentsSet DocumentSets { get; set; } = new ScriptureConfigDocumentsSet();
        public double ConfidenceThreshold { get; set; } = 0.2;
        public Dictionary<string, ScriptureUserPreferences> UsersPreferences { get; protected set; }
            = new Dictionary<string, ScriptureUserPreferences>();
        public ScriptureConfigMetrics Metrics { get; set; } = new ScriptureConfigMetrics();
    }
}
