using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4.Validation;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.DataAccess;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Services
{
    public class UserResourceOwnerPasswordValidator : IResourceOwnerPasswordValidator
    {
        private readonly IRepository<UserEntity> _userRepo;
        private readonly ISystemClock _clock;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserResourceOwnerPasswordValidator(IRepository<UserEntity> userRepo, ISystemClock clock,
            IHttpContextAccessor httpContextAccessor)
        {
            _userRepo = userRepo;
            _clock = clock;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task ValidateAsync(ResourceOwnerPasswordValidationContext context)
        {
            UserEntity user = await _userRepo.Query().SingleOrDefaultAsync(u => u.Username == context.UserName);
            if (user != null && user.VerifyPassword(context.Password))
            {
                string site = _httpContextAccessor.HttpContext.Request.Host.Host;
                context.Result = new GrantValidationResult(user.Id, OidcConstants.AuthenticationMethods.Password,
                    _clock.UtcNow.UtcDateTime, user.GetClaims(site));
            }
        }
    }
}
