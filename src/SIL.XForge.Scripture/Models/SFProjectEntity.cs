using System;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectEntity : ProjectEntity
    {
        public override ProjectRoles Roles => SFProjectRoles.Instance;
        public string ParatextId { get; set; }
        public CheckingConfig CheckingConfig { get; set; } = new CheckingConfig();
        public TranslateConfig TranslateConfig { get; set; } = new TranslateConfig();
        public DateTime LastSyncedDate { get; set; } = DateTimeOffset.FromUnixTimeSeconds(0).UtcDateTime;
    }
}
