using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4.Validation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Identity.Services
{
    public class UserResourceOwnerPasswordValidator : IResourceOwnerPasswordValidator
    {
        private readonly IRepository<UserEntity> _userRepo;
        private readonly ISystemClock _clock;
        private readonly IOptions<SiteOptions> _siteOptions;

        public UserResourceOwnerPasswordValidator(IRepository<UserEntity> userRepo, ISystemClock clock,
            IOptions<SiteOptions> siteOptions)
        {
            _userRepo = userRepo;
            _clock = clock;
            _siteOptions = siteOptions;
        }

        public async Task ValidateAsync(ResourceOwnerPasswordValidationContext context)
        {
            UserEntity user = await _userRepo.Query().SingleOrDefaultAsync(
                u => u.Username == context.UserName.ToLowerInvariant()
                    || u.CanonicalEmail == UserEntity.CanonicalizeEmail(context.UserName));
            if (user != null && user.VerifyPassword(context.Password))
            {
                string site = _siteOptions.Value.Origin.Host;
                context.Result = new GrantValidationResult(user.Id, OidcConstants.AuthenticationMethods.Password,
                    _clock.UtcNow.UtcDateTime, user.GetClaims(site));
            }
        }
    }
}
