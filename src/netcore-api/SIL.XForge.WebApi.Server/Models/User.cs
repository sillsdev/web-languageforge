using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{
    public class User : EntityBase
    {
        public string Username { get; set; }
        public string Name { get; set; }
        public string Role { get; set; }
        public Dictionary<string, string> SiteRole { get; protected set; } = new Dictionary<string, string>();
        public AccessTokenInfo ParatextAccessToken { get; set; } = new AccessTokenInfo();
        public List<string> Projects { get; protected set; } = new List<string>();

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public bool HasRight(string site, Right right)
        {
            return SiteRoles.Instance.HasRight(this, site, right) || SystemRoles.Instance.HasRight(this, right);
        }
    }
}
