namespace SIL.XForge.WebApi.Server.Models
{
    public class SendReceiveJob : EntityBase
    {
        public const string PendingState = "PENDING";
        public const string SyncingState = "SYNCING";
        public const string IdleState = "IDLE";

        public string ProjectRef { get; set; }
        public string BackgroundJobId { get; set; }
        public string State { get; set; }
        public double PercentCompleted { get; set; }
        public int StartCount { get; set; }
    }
}
