using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateConfig
    {
        public TranslateConfigDocType Source { get; set; } = new TranslateConfigDocType();
        public TranslateConfigDocType Target { get; set; } = new TranslateConfigDocType();
        public bool IsTranslationDataShared { get; set; }
        public bool IsTranslationDataScripture { get; set; }
        public TranslateConfigDocumentsSet DocumentSets { get; set; } = new TranslateConfigDocumentsSet();
        public double ConfidenceThreshold { get; set; } = 0.2;
        public Dictionary<string, TranslateUserPreferences> UsersPreferences { get; protected set; }
            = new Dictionary<string, TranslateUserPreferences>();
        public TranslateConfigMetrics Metrics { get; set; } = new TranslateConfigMetrics();
    }
}
