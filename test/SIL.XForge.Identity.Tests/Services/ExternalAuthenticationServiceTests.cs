using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer4;
using IdentityServer4.Events;
using IdentityServer4.Extensions;
using IdentityServer4.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Authentication;
using SIL.XForge.Models;

namespace SIL.XForge.Identity.Services
{
    [TestFixture]
    public class ExternalAuthenticationServiceTests
    {
        private const string TestUserId = "user01";
        private const string TestName = "Test User";
        private const string TestUserEmail = "abc@fakegmail.com";
        private const string ParatextId = "pt01";
        private const string ParatextName = "Paratext User";
        private const string AccessToken = "access_token_value";
        private const string RefreshToken = "refresh_token_value";

        [Test]
        public async Task LogInAsync_UserExists()
        {
            var env = new TestEnvironment();
            env.SetAuthenticateResult(TestUserEmail);

            string returnUrl = await env.Service.LogInAsync();

            Assert.That(returnUrl, Is.Null);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
            await env.AuthService.Received().SignOutAsync(Arg.Any<HttpContext>(),
                IdentityServerConstants.ExternalCookieAuthenticationScheme, Arg.Any<AuthenticationProperties>());
            UserEntity user = await env.Users.GetAsync(TestUserId);
            Assert.That(user.ParatextId, Is.EqualTo(ParatextId));
            Assert.That(user.ParatextTokens.RefreshToken, Is.EqualTo(RefreshToken));
            Assert.That(user.ParatextTokens.AccessToken, Is.EqualTo(AccessToken));
        }

        [Test]
        public async Task LogInAsync_UserDoesNotExist()
        {
            const string ParatextEmail = "new@example.com";
            var env = new TestEnvironment();
            env.SetAuthenticateResult(ParatextEmail);

            string returnUrl = await env.Service.LogInAsync();

            Assert.That(returnUrl, Is.EqualTo($"/identity/external-sign-up?name={ParatextName}&email={ParatextEmail}"));
        }

        [Test]
        public async Task LogInAsync_LinkAccount()
        {
            const string ParatextEmail = "new@example.com";
            var env = new TestEnvironment();
            env.SetAuthenticateResult(ParatextEmail);

            string returnUrl = await env.Service.LogInAsync(TestUserId);

            Assert.That(returnUrl, Is.Null);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
            await env.AuthService.Received().SignOutAsync(Arg.Any<HttpContext>(),
                IdentityServerConstants.ExternalCookieAuthenticationScheme, Arg.Any<AuthenticationProperties>());
            UserEntity user = await env.Users.GetAsync(TestUserId);
            Assert.That(user.ParatextId, Is.EqualTo(ParatextId));
            Assert.That(user.ParatextTokens.RefreshToken, Is.EqualTo(RefreshToken));
            Assert.That(user.ParatextTokens.AccessToken, Is.EqualTo(AccessToken));
        }

        [Test]
        public async Task SignUpAsync_UserExists()
        {
            var env = new TestEnvironment();
            env.SetAuthenticateResult(TestUserEmail);

            (bool success, string returnUrl) = await env.Service.SignUpAsync();

            Assert.That(success, Is.False);
            Assert.That(returnUrl, Is.Null);
        }

        [Test]
        public async Task SignUpAsync_UserDoesNotExist()
        {
            const string ParatextEmail = "new@test.com";
            var env = new TestEnvironment();
            env.SetAuthenticateResult(ParatextEmail);

            (bool success, string returnUrl) = await env.Service.SignUpAsync();

            Assert.That(success, Is.True);
            Assert.That(returnUrl, Is.Null);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Any<ClaimsPrincipal>(),
                Arg.Any<AuthenticationProperties>());
            await env.AuthService.Received().SignOutAsync(Arg.Any<HttpContext>(),
                IdentityServerConstants.ExternalCookieAuthenticationScheme, Arg.Any<AuthenticationProperties>());
            UserEntity user = env.Users.Query().Single(u => u.Email == ParatextEmail);
            Assert.That(user.ParatextId, Is.EqualTo(ParatextId));
            Assert.That(user.ParatextTokens.RefreshToken, Is.EqualTo(RefreshToken));
            Assert.That(user.ParatextTokens.AccessToken, Is.EqualTo(AccessToken));
        }

        class TestEnvironment : HttpTestEnvironmentBase
        {
            public TestEnvironment()
            {
                Users = new MemoryRepository<UserEntity>(
                    uniqueKeySelectors: new Func<UserEntity, object>[]
                    {
                        u => u.CanonicalEmail,
                        u => u.Username
                    },
                    entities: new[]
                    {
                        new UserEntity
                        {
                            Id = TestUserId,
                            Name = TestName,
                            Email = TestUserEmail,
                            CanonicalEmail = UserEntity.CanonicalizeEmail(TestUserEmail)
                        }
                    });

                Events = Substitute.For<IEventService>();
                Service = new ExternalAuthenticationService(Events, Users, HttpContextAccessor);
            }

            public MemoryRepository<UserEntity> Users { get; }
            public IEventService Events { get; }
            public ExternalAuthenticationService Service { get; }

            public void SetAuthenticateResult(string email)
            {
                var identity = new ClaimsIdentity(new[]
                    {
                        new Claim(JwtClaimTypes.Subject, ParatextId),
                        new Claim(JwtClaimTypes.Email, email),
                        new Claim(JwtClaimTypes.Name, ParatextName)
                    });
                var principal = new ClaimsPrincipal(identity);
                var props = new AuthenticationProperties(new Dictionary<string, string>
                    {
                        { "scheme", ParatextAuthenticationDefaults.AuthenticationScheme },
                        { "rememberLogIn", "true" }
                    });
                props.StoreTokens(new[]
                    {
                        new AuthenticationToken { Name = "access_token", Value = AccessToken },
                        new AuthenticationToken { Name = "refresh_token", Value = RefreshToken },
                        new AuthenticationToken { Name = "id_token", Value = "id_token_value" },
                    });
                var result = AuthenticateResult.Success(new AuthenticationTicket(principal, props,
                    IdentityServerConstants.ExternalCookieAuthenticationScheme));
                AuthService.AuthenticateAsync(Arg.Any<HttpContext>(),
                    IdentityServerConstants.ExternalCookieAuthenticationScheme).Returns(Task.FromResult(result));
            }
        }
    }
}
