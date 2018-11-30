using Microsoft.AspNetCore.Http;

namespace SIL.XForge.Services
{
    public interface IHttpRequestAccessor
    {
        PathString Path { get; }
        HostString Host { get; }
    }
}
