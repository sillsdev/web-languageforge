using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4.Validation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.Identity.Services
{
    public class UserResourceOwnerPasswordValidator : IResourceOwnerPasswordValidator
    {
        private readonly IRepository<UserEntity> _users;
        private readonly ISystemClock _clock;
        private readonly IOptions<SiteOptions> _siteOptions;

        public UserResourceOwnerPasswordValidator(IRepository<UserEntity> users, ISystemClock clock,
            IOptions<SiteOptions> siteOptions)
        {
            _users = users;
            _clock = clock;
            _siteOptions = siteOptions;
        }

        public async Task ValidateAsync(ResourceOwnerPasswordValidationContext context)
        {
            Attempt<UserEntity> attempt = await _users.TryGetByIdentifier(context.UserName);
            if (attempt.TryResult(out UserEntity user) && user.VerifyPassword(context.Password))
            {
                string site = _siteOptions.Value.Origin.Host;
                context.Result = new GrantValidationResult(user.Id, OidcConstants.AuthenticationMethods.Password,
                    _clock.UtcNow.UtcDateTime, user.GetClaims(site));
            }
        }
    }
}
