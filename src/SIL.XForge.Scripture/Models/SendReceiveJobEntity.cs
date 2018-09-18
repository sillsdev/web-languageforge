using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SendReceiveJobEntity : ProjectDataEntity
    {
        public const string PendingState = "PENDING";
        public const string SyncingState = "SYNCING";
        public const string IdleState = "IDLE";
        public const string HoldState = "HOLD";
        public static string[] ActiveStates = { PendingState, SyncingState };

        public string BackgroundJobId { get; set; }
        public string State { get; set; }
        public double PercentCompleted { get; set; }
        public int StartCount { get; set; }
    }
}
