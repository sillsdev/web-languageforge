using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{
    public abstract class Project : IEntity
    {
        public const string LexiconApp = "lexicon";
        public const string TranslateApp = "translate";

        public string Id { get; set; }
        public string ProjectName { get; set; }
        public Dictionary<string, ProjectRole> Users { get; protected set; } = new Dictionary<string, ProjectRole>();
        public string AppName { get; protected set; }
        public string ProjectCode { get; set; }

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public abstract ProjectRoles Roles { get; }

        public bool HasRight(string userId, Right right)
        {
            return Roles.HasRight(this, userId, right);
        }
    }
}
