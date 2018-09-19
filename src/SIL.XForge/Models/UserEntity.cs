using System;
using System.Collections.Generic;
using System.Security.Claims;
using IdentityModel;

namespace SIL.XForge.Models
{
    public class UserEntity : Entity
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
        public List<string> GoogleOAuthIds { get; protected set; } = new List<string>();
        public List<string> ParatextOAuthIds { get; protected set; } = new List<string>();
        public List<string> FacebookOAuthIds { get; protected set; } = new List<string>();
        public bool Active { get; set; }
        public string Password { get; set; }
        public List<string> Projects { get; protected set; } = new List<string>();
        public AccessTokenInfo ParatextAccessToken { get; set; } = new AccessTokenInfo();

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public IEnumerable<Claim> GetClaims(string site)
        {
            return new List<Claim>
            {
                new Claim(JwtClaimTypes.Subject, Id),
                new Claim(JwtClaimTypes.PreferredUserName, Username),
                new Claim(JwtClaimTypes.Name, Name),
                new Claim(JwtClaimTypes.Email, Email),
                new Claim(JwtClaimTypes.Role, Role)
            };
        }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, Password);
        }
    }
}
