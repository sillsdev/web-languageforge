using System;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Identity.Controllers.Account
{
    [TestFixture]
    public class AccountControllerTests
    {
        [Test]
        public async Task Login_CorrectPassword()
        {
            var env = new TestEnvironment();

            var model = new LoginInputModel
            {
                Username = "user",
                Password = "password",
                ReturnUrl = "https://beta.scriptureforge.local/home"
            };
            IActionResult result = await env.Controller.Login(model, "login");

            Assert.That(result, Is.TypeOf<RedirectResult>());
            var redirectResult = (RedirectResult) result;
            Assert.That(redirectResult.Url, Is.EqualTo("https://beta.scriptureforge.local/home"));
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == "user01"),
                Arg.Any<AuthenticationProperties>());
        }

        [Test]
        public async Task Login_IncorrectPassword()
        {
            var env = new TestEnvironment();

            var model = new LoginInputModel
            {
                Username = "user",
                Password = "wrong",
                ReturnUrl = "https://beta.scriptureforge.local/home"
            };
            IActionResult result = await env.Controller.Login(model, "login");

            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.That(env.Controller.ModelState.ErrorCount, Is.EqualTo(1));
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
        }


        class TestEnvironment
        {
            public TestEnvironment()
            {
                var interaction = Substitute.For<IIdentityServerInteractionService>();
                var authorizationRequest = new AuthorizationRequest
                {
                    ClientId = "xForge"
                };
                interaction.GetAuthorizationContextAsync(null).ReturnsForAnyArgs(Task.FromResult(authorizationRequest));
                var clientStore = Substitute.For<IClientStore>();
                var schemeProvider = Substitute.For<IAuthenticationSchemeProvider>();
                var cookieAuthScheme = new AuthenticationScheme(CookieAuthenticationDefaults.AuthenticationScheme,
                    CookieAuthenticationDefaults.AuthenticationScheme, typeof(CookieAuthenticationHandler));
                schemeProvider.GetDefaultAuthenticateSchemeAsync().Returns(Task.FromResult(cookieAuthScheme));
                Events = Substitute.For<IEventService>();
                var users = new MemoryRepository<UserEntity>(new[]
                    {
                        new UserEntity
                        {
                            Id = "user01",
                            Username = "user",
                            Password = BCrypt.Net.BCrypt.HashPassword("password", 7)
                        }
                    });
                AuthService = Substitute.For<IAuthenticationService>();
                var tempDataDictionaryFactory = Substitute.For<ITempDataDictionaryFactory>();
                var serviceProvider = Substitute.For<IServiceProvider>();
                serviceProvider.GetService(typeof(IAuthenticationService)).Returns(AuthService);
                serviceProvider.GetService(typeof(ISystemClock)).Returns(new SystemClock());
                serviceProvider.GetService(typeof(IAuthenticationSchemeProvider)).Returns(schemeProvider);
                Controller = new AccountController(interaction, clientStore, schemeProvider, Events, users)
                {
                    ControllerContext = new ControllerContext
                    {
                        HttpContext = new DefaultHttpContext
                        {
                            RequestServices = serviceProvider
                        },
                    },
                    TempData = Substitute.For<ITempDataDictionary>()
                };
            }

            public IAuthenticationService AuthService { get; }
            public IEventService Events { get; }
            public AccountController Controller { get; }
        }
    }
}
