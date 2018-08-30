using System.Collections.Generic;
using System.IO;

namespace SIL.XForge.WebApi.Server.Models
{
    public abstract class ProjectEntity : EntityBase
    {
        public const string TranslateApp = "translate";
        public const string SFChecksApp = "sfchecks";

        public string OwnerRef { get; set; }
        public string ProjectName { get; set; }
        public Dictionary<string, ProjectRole> Users { get; protected set; } = new Dictionary<string, ProjectRole>();
        public string AppName { get; protected set; }
        public string ProjectCode { get; set; }

        public string AssetsFolderPath
        {
            get { return Path.Combine("assets", AppName, "sf_" + ProjectCode); }
        }

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public abstract ProjectRoles Roles { get; }

        public bool HasRight(string userId, Right right)
        {
            return Roles.HasRight(this, userId, right);
        }
    }
}
