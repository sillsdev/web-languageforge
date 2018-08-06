namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateUserPreferences
    {
        public double ConfidenceThreshold { get; set; }
        public bool HasConfidenceOverride { get; set; }
        public bool IsDocumentOrientationTargetRight { get; set; } = true;
        public bool IsFormattingOptionsShown { get; set; }
        public string SelectedDocumentSetId { get; set; } = "";
        public string SelectedSegmentRef { get; set; } = "";
        public int SelectedSegmentChecksum { get; set; }
    }
}
