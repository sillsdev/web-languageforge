using JsonApiDotNetCore.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SyncJobResource : SFProjectDataResource
    {
        [Attr("percent-completed")]
        public double PercentCompleted { get; set; }
        [Attr("state")]
        public string State { get; set; }
    }
}
