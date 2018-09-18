using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SendReceiveJobResource : ProjectDataResource
    {
        [Attr("percent-completed")]
        public double PercentCompleted { get; set; }
        [Attr("state")]
        public string State { get; set; }
    }
}
