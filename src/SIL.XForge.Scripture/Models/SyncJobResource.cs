using JsonApiDotNetCore.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SyncJobResource : SFProjectDataResource
    {
        [Attr]
        public double PercentCompleted { get; set; }
        [Attr]
        public SyncJobState State { get; set; }
    }
}
