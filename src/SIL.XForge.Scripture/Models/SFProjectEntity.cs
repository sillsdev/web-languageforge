using System;
using System.Collections.Generic;
using System.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectEntity : ProjectEntity
    {
        public override ProjectRoles Roles => SFProjectRoles.Instance;
        public List<SFProjectUserEntity> Users { get; protected set; } = new List<SFProjectUserEntity>();
        public string ParatextId { get; set; }
        public InputSystem InputSystem { get; set; } = new InputSystem();
        public CheckingConfig CheckingConfig { get; set; } = new CheckingConfig();
        public TranslateConfig TranslateConfig { get; set; } = new TranslateConfig();
        public DateTime LastSyncedDate { get; set; } = DateTimeOffset.FromUnixTimeSeconds(0).UtcDateTime;

        public override bool TryGetRole(string userId, out string role)
        {
            role = Users.FirstOrDefault(u => u.UserRef == userId)?.Role;
            return role != null;
        }
    }
}
