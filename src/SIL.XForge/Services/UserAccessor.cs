using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace SIL.XForge.Services
{
    public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        private ClaimsPrincipal User => _httpContextAccessor.HttpContext.User;

        public bool IsAuthenticated => User.Identity.IsAuthenticated;
        public string UserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        public string SystemRole => User.FindFirst(ClaimTypes.Role)?.Value;
    }
}
