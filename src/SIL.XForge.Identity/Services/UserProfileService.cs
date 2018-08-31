using System.Threading.Tasks;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Http;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.Identity.Services
{
    public class UserProfileService : IProfileService
    {
        private readonly IRepository<UserEntity> _userRepo;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserProfileService(IRepository<UserEntity> userRepo, IHttpContextAccessor httpContextAccessor)
        {
            _userRepo = userRepo;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            string site = _httpContextAccessor.HttpContext.Request.Host.Host;
            Attempt<UserEntity> attempt = await _userRepo.TryGetAsync(context.Subject.GetSubjectId());
            if (attempt.TryResult(out UserEntity user))
                context.AddRequestedClaims(user.GetClaims(site));
        }

        public async Task IsActiveAsync(IsActiveContext context)
        {
            Attempt<UserEntity> attempt = await _userRepo.TryGetAsync(context.Subject.GetSubjectId());
            if (attempt.TryResult(out UserEntity user))
                context.IsActive = user.Active;
            else
                context.IsActive = false;
        }
    }
}
