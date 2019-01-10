using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using NSubstitute;

namespace SIL.XForge.Identity
{
    public class HttpTestEnvironmentBase
    {
        protected HttpTestEnvironmentBase()
        {
            var serviceProvider = Substitute.For<IServiceProvider>();
            AuthService = Substitute.For<IAuthenticationService>();
            serviceProvider.GetService(typeof(IAuthenticationService)).Returns(AuthService);
            serviceProvider.GetService(typeof(ISystemClock)).Returns(new SystemClock());
            var schemeProvider = Substitute.For<IAuthenticationSchemeProvider>();
            var cookieAuthScheme = new AuthenticationScheme(CookieAuthenticationDefaults.AuthenticationScheme,
                CookieAuthenticationDefaults.AuthenticationScheme, typeof(CookieAuthenticationHandler));
            schemeProvider.GetDefaultAuthenticateSchemeAsync().Returns(Task.FromResult(cookieAuthScheme));
            serviceProvider.GetService(typeof(IAuthenticationSchemeProvider)).Returns(schemeProvider);

            HttpContextAccessor = Substitute.For<IHttpContextAccessor>();
            HttpContextAccessor.HttpContext.Returns(new DefaultHttpContext
            {
                RequestServices = serviceProvider
            });
        }

        public IAuthenticationService AuthService { get; }
        public IHttpContextAccessor HttpContextAccessor { get; }
    }
}
