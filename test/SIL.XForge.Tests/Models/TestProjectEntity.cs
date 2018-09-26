using System.Collections.Generic;
using System.Linq;

namespace SIL.XForge.Models
{
    public class TestProjectEntity : ProjectEntity
    {
        public override ProjectRoles Roles => TestProjectRoles.Instance;

        public List<ProjectUserEntity> Users { get; protected set; } = new List<ProjectUserEntity>();

        public override bool TryGetRole(string userId, out string role)
        {
            role = Users.FirstOrDefault(u => u.UserRef == userId)?.Role;
            return role != null;
        }
    }
}
