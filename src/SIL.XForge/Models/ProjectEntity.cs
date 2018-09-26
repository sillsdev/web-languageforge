using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public abstract class ProjectEntity : Entity
    {
        public string ProjectName { get; set; }

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public abstract ProjectRoles Roles { get; }

        public abstract bool TryGetRole(string userId, out string role);

        public bool HasRight(string userId, Right right)
        {
            if (TryGetRole(userId, out string role))
                return Roles.Rights[role].Contains(right);
            return false;
        }
    }
}
