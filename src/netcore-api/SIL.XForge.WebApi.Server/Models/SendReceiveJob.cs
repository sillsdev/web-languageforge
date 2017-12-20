namespace SIL.XForge.WebApi.Server.Models
{
    public class SendReceiveJob : IEntity
    {
        public const string PendingState = "PENDING";
        public const string SyncingState = "SYNCING";
        public const string IdleState = "IDLE";

        public string Id { get; set; }
        public string ProjectRef { get; set; }
        public string BackgroundJobId { get; set; }
        public string State { get; set; } = PendingState;
        public double PercentCompleted { get; set; }
    }
}
