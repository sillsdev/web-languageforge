using System;
using System.Linq;
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
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.Extensions.Options;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Models;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Identity.Controllers
{
    [TestFixture]
    public class IdentityControllerTests
    {
        private const string TestUserId = "user01";
        private const string TestUsername = "user";
        private const string TestPassword = "pa$$w0rd";
        private const string TestResetPasswordKey = "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR9";
        private const string TestUserEmail = "abc@fakegmail.com";
        private const string TestReturnUrl = "http://beta.scriptureforge.localhost/home";
        private const string ShowMessageKey = "showMessage";

        [Test]
        public async Task LogIn_CorrectPassword()
        {
            var env = new TestEnvironment();

            var input = new LogInParams
            {
                User = TestUsername,
                Password = TestPassword,
                ReturnUrl = TestReturnUrl
            };
            ActionResult<LogInResult> result = await env.Controller.LogIn(input);

            Assert.That(result.Value.Success, Is.True);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
        }

        [Test]
        public async Task LogIn_CaseInsensitiveEmail()
        {
            var env = new TestEnvironment();

            var input = new LogInParams
            {
                User = "ABC@fakegmail.com",
                Password = TestPassword,
                ReturnUrl = TestReturnUrl
            };
            ActionResult<LogInResult> result = await env.Controller.LogIn(input);

            Assert.That(result.Value.Success, Is.True);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
        }

        [Test]
        public async Task LogIn_IncorrectPassword()
        {
            var env = new TestEnvironment();

            var input = new LogInParams
            {
                User = TestUsername,
                Password = "wrong",
                ReturnUrl = TestReturnUrl
            };
            ActionResult<LogInResult> result = await env.Controller.LogIn(input);

            Assert.That(result.Value.Success, Is.False);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
        }

        [Test]
        public async Task ForgotPassword_CorrectEmailOrUsername(
            [Values(TestUsername, TestUserEmail)] string emailOrUsername)
        {
            var env = new TestEnvironment(isResetLinkExpired: true);

            var input = new ForgotPasswordParams
            {
                User = emailOrUsername
            };
            ActionResult<IdentityResult> result = await env.Controller.ForgotPassword(input);

            Assert.That(result.Value.Success, Is.True);
            UserEntity user = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(user.ResetPasswordKey, Is.Not.EqualTo(TestResetPasswordKey), "ResetPasswordKey not updated.");
            Assert.That(user.ResetPasswordExpirationDate, Is.GreaterThan(DateTime.UtcNow),
                "ResetPasswordExpirationDate expired very quickly!");

            const string subject = "xForge Forgotten Password Verification";
            // Skip verification for the body; we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(TestUserEmail), Arg.Is(subject), Arg.Any<string>());
        }

        [Test]
        public async Task ForgotPassword_IncorrectEmailOrUsername()
        {
            var env = new TestEnvironment();

            var input = new ForgotPasswordParams
            {
                User = "user1"
            };
            ActionResult<IdentityResult> result = await env.Controller.ForgotPassword(input);

            Assert.That(result.Value.Success, Is.False);
        }

        [Test]
        public async Task ResetPassword_IncorrectKey_PasswordNotSaved()
        {
            var env = new TestEnvironment();
            const string NewPassword = "NewPassword";

            var input = new ResetPasswordParams
            {
                Key = TestResetPasswordKey + "bad",
                Password = NewPassword
            };
            ActionResult<IdentityResult> result = await env.Controller.ResetPassword(input);

            Assert.That(result.Value.Success, Is.False);
            UserEntity user = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(user.VerifyPassword(NewPassword), Is.False, "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_Expired_PasswordNotSaved()
        {
            var env = new TestEnvironment(isResetLinkExpired: true);
            const string NewPassword = "NewPassword";

            var input = new ResetPasswordParams
            {
                Key = TestResetPasswordKey,
                Password = NewPassword
            };
            ActionResult<IdentityResult> result = await env.Controller.ResetPassword(input);

            Assert.That(result.Value.Success, Is.False);
            UserEntity user = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(user.VerifyPassword(NewPassword), Is.False, "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_PasswordSaved()
        {
            var env = new TestEnvironment();
            const string NewPassword = "N3wP@ssword";

            var input = new ResetPasswordParams
            {
                Key = TestResetPasswordKey,
                Password = NewPassword
            };
            ActionResult<IdentityResult> result = await env.Controller.ResetPassword(input);

            Assert.That(result.Value.Success, Is.True);
             UserEntity user = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(user.VerifyPassword(NewPassword), Is.True, "Password should have been updated");
            Assert.That(user.ResetPasswordKey, Is.Null);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
        }

        [Test]
        public async Task ResetPassword_LinkWorksOnlyOnce()
        {
            var env = new TestEnvironment();

            var input = new ResetPasswordParams
            {
                Key = TestResetPasswordKey,
                Password = "NewPassword"
            };
            ActionResult<IdentityResult> result = await env.Controller.ResetPassword(input);

            Assert.That(result.Value.Success, Is.True);

            result = await env.Controller.ResetPassword(input);

            Assert.That(result.Value.Success, Is.False);
        }

        [Test]
        public async Task SendInvite_NoUser_InvitedEmail()
        {
            var env = new TestEnvironment();
            var parameters = new SendInviteParams
            {
                Email = "abc1@example.com"
            };
            Assert.That(env.Users.Query().Any(x => x.Email == parameters.Email), Is.False);

            var result = await env.Controller.SendInvite(parameters);

            Assert.That(result, Is.Not.Null);
            Assert.That(env.Users.Query().Any(x => x.Email == parameters.Email), Is.True);
            Assert.That(result.Value.Success, Is.True);
            Assert.That(result.Value.IsAlreadyInProject, Is.False);
            Assert.AreEqual("invited", result.Value.EmailTypeSent);
            string subject = "You've been invited to the project [Project Name] on xForge";
            // Skip verification for the body, we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(parameters.Email), Arg.Is(subject), Arg.Any<string>());
        }

        [Test]
        public async Task SendInvite_UserNoProjects_JoinedEmail()
        {
            var env = new TestEnvironment();
            var parameters = new SendInviteParams
            {
                Email = "abc1@example.com"
            };
            env.Users.Add(new[]
                {
                    new UserEntity
                    {
                        Id = "userWithNoProjects",
                        Email = parameters.Email,
                        CanonicalEmail = parameters.Email
                    }
                });
            Assert.That(env.Users.Query().Any(x => x.Email == parameters.Email), Is.True);

            var result = await env.Controller.SendInvite(parameters);

            Assert.That(result, Is.Not.Null);
            Assert.That(env.Users.Query().Any(x => x.Email == parameters.Email), Is.True);
            Assert.That(result.Value.Success, Is.True);
            Assert.That(result.Value.IsAlreadyInProject, Is.False);
            Assert.AreEqual("joined", result.Value.EmailTypeSent);
            string subject = "You've been added to the project [Project Name] on xForge";
            // Skip verification for the body, we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(parameters.Email), Arg.Is(subject), Arg.Any<string>());
        }

        [Test]
        public async Task SignUp_NewUserAdded()
        {
            var env = new TestEnvironment();

            var input = new SignUpParams
            {
                Name = "Test Sample Name",
                Password = "password1234",
                Email = "testeremail@gmail.com"
            };
            ActionResult<IdentityResult> result = await env.Controller.SignUp(input);

            Assert.That(result.Value.Success, Is.True);
            Assert.That(env.Users.Query().Any(x => x.Email == input.Email), Is.True);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme, Arg.Any<ClaimsPrincipal>(),
                Arg.Any<AuthenticationProperties>());
        }

        [Test]
        public async Task SignUp_DuplicateEmailOrUserRejected()
        {
            var env = new TestEnvironment();

            env.Users.Add(new UserEntity
                {
                    Id = "uniqueidwithdupemailid",
                    Password = BCrypt.Net.BCrypt.HashPassword("unimportant1234", 7),
                    Email = "duplicate@example.com",
                    CanonicalEmail = "duplicate@example.com",
                    Active = true
                });
            // Duplicate emailid should result in an error
            var input = new SignUpParams
            {
                Name = "Non Duplicated Name",
                Password = "unimportant1234",
                Email = "DUPLICATE@example.com"
            };
            ActionResult<IdentityResult> result = await env.Controller.SignUp(input);

            Assert.That(result.Value.Success, Is.False);
        }

        [Test]
        public async Task SignUp_InvitedUser()
        {
            var env = new TestEnvironment();

            env.Users.Add(new UserEntity
                {
                    Id = "uniqueidforinviteduser",
                    Email = "me@example.com",
                    CanonicalEmail = "me@example.com"
                });
            var input = new SignUpParams
            {
                Name = "User Name",
                Password = "unimportant1234",
                Email = "me@example.com"
            };
            ActionResult<IdentityResult> result = await env.Controller.SignUp(input);

            Assert.That(result.Value.Success, Is.True);
        }

        private class TestEnvironment
        {
            public TestEnvironment(bool isResetLinkExpired = false)
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
                            Username = TestUsername,
                            Password = BCrypt.Net.BCrypt.HashPassword(TestPassword, 7),
                            ResetPasswordKey =  TestResetPasswordKey,
                            ResetPasswordExpirationDate = isResetLinkExpired
                                ? DateTime.UtcNow.AddTicks(-1)
                                : DateTime.UtcNow.AddMinutes(2),
                            Email = TestUserEmail,
                            CanonicalEmail = UserEntity.CanonicalizeEmail(TestUserEmail)
                        }
                    });
                AuthService = Substitute.For<IAuthenticationService>();
                var serviceProvider = Substitute.For<IServiceProvider>();
                var options = Substitute.For<IOptions<SiteOptions>>();
                options.Value.Returns(new SiteOptions
                    {
                        Name = "xForge",
                        Origin = new Uri("http://localhost")
                    });

                EmailService = Substitute.For<IEmailService>();

                var urlHelperFactory = Substitute.For<IUrlHelperFactory>();

                serviceProvider.GetService(typeof(IAuthenticationService)).Returns(AuthService);
                serviceProvider.GetService(typeof(ISystemClock)).Returns(new SystemClock());
                serviceProvider.GetService(typeof(IAuthenticationSchemeProvider)).Returns(schemeProvider);
                serviceProvider.GetService(typeof(IOptions<SiteOptions>)).Returns(options);

                serviceProvider.GetService(typeof(IEmailService)).Returns(EmailService);
                serviceProvider.GetService(typeof(IUrlHelperFactory)).Returns(urlHelperFactory);

                Controller = new IdentityController(interaction, clientStore, Events, Users, options,
                    EmailService)
                {
                    ControllerContext = new ControllerContext
                    {
                        HttpContext = new DefaultHttpContext
                        {
                            RequestServices = serviceProvider
                        },
                    }
                };
            }

            public IAuthenticationService AuthService { get; }
            public IEventService Events { get; }
            public IdentityController Controller { get; }
            public MemoryRepository<UserEntity> Users { get; }
            public IEmailService EmailService { get; }

        }
    }
}
