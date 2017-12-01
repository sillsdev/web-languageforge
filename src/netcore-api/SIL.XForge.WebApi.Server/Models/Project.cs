using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{
    public abstract class Project : IEntity
    {
        public string Id { get; set; }
        public string ProjectName { get; set; }
        public Dictionary<string, ProjectRole> Users { get; set; }
        public string AppName { get; set; }

        public Dictionary<string, object> ExtraElements { get; set; }

        public abstract ProjectRoles Roles { get; }

        public bool HasRight(string userId, Right right)
        {
            return Roles.HasRight(this, userId, right);
        }
    }
}
