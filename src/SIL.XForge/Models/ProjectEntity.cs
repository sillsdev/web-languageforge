using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public abstract class ProjectEntity : EntityBase
    {
        public string OwnerRef { get; set; }
        public string ProjectName { get; set; }
        public Dictionary<string, ProjectRole> Users { get; protected set; } = new Dictionary<string, ProjectRole>();
        public string ProjectCode { get; set; }

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public abstract ProjectRoles Roles { get; }

        public bool HasRight(string userId, Right right)
        {
            return Roles.HasRight(this, userId, right);
        }
    }
}
