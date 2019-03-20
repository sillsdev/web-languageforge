namespace SIL.XForge.Scripture.Models
{
    public class CheckingConfig : TaskConfig
    {
        public bool UsersSeeEachOthersResponses { get; set; } = true;
        public bool DownloadAudioFiles { get; set; } = true;
        public CheckingConfigShare share { get; set; } = new CheckingConfigShare();
    }

    public class CheckingConfigShare
    {
        public bool Enabled { get; set; } = true;
        public bool ViaEmail { get; set; } = true;
        // public bool ViaFacebook { get; set; } = true; // not in MVP
    }
}
