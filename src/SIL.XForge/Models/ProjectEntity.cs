using System.Collections.Generic;
using System.Linq;

namespace SIL.XForge.Models
{
    public abstract class ProjectEntity : Entity
    {
        public string ProjectName { get; set; }
        public InputSystem InputSystem { get; set; } = new InputSystem();

        public List<ProjectUserEntity> Users { get; protected set; } = new List<ProjectUserEntity>();

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public abstract ProjectRoles Roles { get; }

        public bool TryGetRole(string userId, out string role)
        {
            role = Users.FirstOrDefault(u => u.UserRef == userId)?.Role;
            return role != null;
        }

        public bool HasRight(string userId, Right right)
        {
            if (TryGetRole(userId, out string role))
                return Roles.Rights[role].Contains(right);
            return false;
        }
    }
}
