using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectResource : ProjectResource
    {
        public const string ActiveSendReceiveJobRelationship = "active-send-receive-job";

        [Attr("config")]
        public SFConfig Config { get; set; }

        [HasOne(ActiveSendReceiveJobRelationship)]
        public SendReceiveJobResource ActiveSendReceiveJob { get; set; }
    }
}
