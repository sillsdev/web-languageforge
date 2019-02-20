using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SyncJobResource : ProjectDataResource
    {
        [Attr]
        public double PercentCompleted { get; set; }
        [Attr]
        public string State { get; set; }
    }
}
