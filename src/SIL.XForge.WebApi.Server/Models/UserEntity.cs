using System;
using System.Collections.Generic;
using System.Security.Claims;
using IdentityModel;

namespace SIL.XForge.WebApi.Server.Models
{
    public class UserEntity : EntityBase
    {
        public string Username { get; set; }
        public string Name { get; set; }
        public string EmailPending { get; set; }
        public string Email { get; set; }
        public string ValidationKey { get; set; }
        public DateTime ValidationExpirationDate { get; set; }
        public string ResetPasswordKey { get; set; }
        public DateTime ResetPasswordExpirationDate { get; set; }
        public string Role { get; set; }
        public Dictionary<string, string> SiteRole { get; protected set; } = new Dictionary<string, string>();
        public List<string> GoogleOAuthIds { get; protected set; } = new List<string>();
        public List<string> ParatextOAuthIds { get; protected set; } = new List<string>();
        public List<string> FacebookOAuthIds { get; protected set; } = new List<string>();
        public bool Active { get; set; }
        public string Password { get; set; }
        public List<string> Projects { get; protected set; } = new List<string>();
        public AccessTokenInfo ParatextAccessToken { get; set; } = new AccessTokenInfo();

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public bool HasSiteRight(string site, Right right)
        {
            return SiteRoles.Instance.HasRight(this, site, right) || SystemRoles.Instance.HasRight(this, right);
        }

        public IEnumerable<Claim> GetClaims(string site)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtClaimTypes.Subject, Id),
                new Claim(JwtClaimTypes.PreferredUserName, Username),
                new Claim(JwtClaimTypes.Name, Name),
                new Claim(JwtClaimTypes.Email, Email),
                new Claim(JwtClaimTypes.Role, Role)
            };

            if (SiteRole.TryGetValue(site, out string siteRole))
                claims.Add(new Claim("site_role", siteRole));
            return claims;
        }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, Password);
        }
    }
}
