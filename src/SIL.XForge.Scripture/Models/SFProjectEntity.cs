using System;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectEntity : ProjectEntity
    {
        public override ProjectRoles Roles => SFRoles.Instance;
        public SFConfig Config { get; set; } = new SFConfig();
        public DateTime LastSyncedDate { get; set; } = DateTimeOffset.FromUnixTimeSeconds(0).UtcDateTime;
        public bool UsersSeeEachOthersResponses { get; set; } = true;
    }
}
