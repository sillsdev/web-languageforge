using Microsoft.AspNetCore.Http;

namespace SIL.XForge.Services
{
    public class HttpRequestAccessor : IHttpRequestAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public HttpRequestAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public PathString Path => _httpContextAccessor.HttpContext.Request.Path;

        public HostString Host => _httpContextAccessor.HttpContext.Request.Host;
    }
}
