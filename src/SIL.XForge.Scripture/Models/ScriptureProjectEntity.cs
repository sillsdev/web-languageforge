using System;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class ScriptureProjectEntity : ProjectEntity
    {
        public override ProjectRoles Roles => ScriptureRoles.Instance;
        public ScriptureConfig Config { get; set; } = new ScriptureConfig();
        public DateTime LastSyncedDate { get; set; } = DateTimeOffset.FromUnixTimeSeconds(0).UtcDateTime;
        public bool UsersSeeEachOthersResponses { get; set; } = true;
    }
}
