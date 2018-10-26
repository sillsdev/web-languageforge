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
        public string Email { get; set; }
        public bool EmailVerified { get; set; }
        public string ValidationKey { get; set; }
        public DateTime ValidationExpirationDate { get; set; }
        public string ResetPasswordKey { get; set; }
        public DateTime ResetPasswordExpirationDate { get; set; }
        public string Role { get; set; }
        public bool Active { get; set; }
        public string Password { get; set; }
        public string ParatextId { get; set; }
        public Tokens ParatextTokens { get; set; }

        public Dictionary<string, object> ExtraElements { get; protected set; }

        public IEnumerable<Claim> GetClaims(string site)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtClaimTypes.Subject, Id),
                new Claim(JwtClaimTypes.Name, Name),
                new Claim(JwtClaimTypes.Role, Role),
                new Claim(JwtClaimTypes.Email, Email)
            };
            if (Username != null)
                claims.Add(new Claim(JwtClaimTypes.PreferredUserName, Username));
            return claims;
        }

        public bool VerifyPassword(string password)
        {
            return BCrypt.Net.BCrypt.Verify(password, Password);
        }
    }
}
