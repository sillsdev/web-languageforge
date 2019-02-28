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
using Microsoft.Extensions.Options;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Identity.Models;
using SIL.XForge.Models;
using SIL.XForge.Services;
using SIL.XForge.Identity.Configuration;
using SIL.XForge.Identity.Services;

namespace SIL.XForge.Identity.Controllers
{
    [TestFixture]
    public class IdentityRpcControllerTests
    {
        private const string TestUserId = "user01";
        private const string TestUsername = "user";
        private const string TestPassword = "pa$$w0rd";
        private const string TestResetPasswordKey = "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR9";
        private const string TestUserEmail = "abc@fakegmail.com";
        private const string TestReturnUrl = "http://localhost:5000/projects";
        private const string ShowMessageKey = "showMessage";

        [Test]
        public async Task LogIn_CorrectPassword()
        {
            var env = new TestEnvironment();

            LogInResult result = await env.Controller.LogIn(TestUsername, TestPassword, false, TestReturnUrl);

            Assert.That(result.Success, Is.True);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
        }

        [Test]
        public async Task LogIn_CaseInsensitiveUsername()
        {
            var env = new TestEnvironment();

            LogInResult result = await env.Controller.LogIn(TestUsername.ToUpperInvariant(), TestPassword, false,
                TestReturnUrl);

            Assert.That(result.Success, Is.True);
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

            LogInResult result = await env.Controller.LogIn("ABC@fakegmail.com", TestPassword, false, TestReturnUrl);

            Assert.That(result.Success, Is.True);
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

            LogInResult result = await env.Controller.LogIn(TestUsername, "wrong", false, TestReturnUrl);

            Assert.That(result.Success, Is.False);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
        }

        [Test]
        public async Task Login_NullPassword_NoThrow()
        {
            var env = new TestEnvironment();
            string userEmail = "nopassworduser@example.com";
            env.Users.Add(new UserEntity
            {
                Id = "nopassworduser",
                Email = userEmail,
                CanonicalEmail = userEmail
            });

            LogInResult result = await env.Controller.LogIn(userEmail, TestPassword, false, TestReturnUrl);

            Assert.That(result.Success, Is.False);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
        }

        [Test]
        public async Task Login_EmptyPassword_NoThrow()
        {
            var env = new TestEnvironment();
            string userEmail = "nopassworduser@example.com";
            env.Users.Add(new UserEntity
            {
                Id = "nopassworduser",
                Email = userEmail,
                CanonicalEmail = userEmail,
                Password = ""
            });

            LogInResult result = await env.Controller.LogIn(userEmail, TestPassword, false, TestReturnUrl);

            Assert.That(result.Success, Is.False);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
        }

        [Test]
        public async Task ForgotPassword_CorrectEmailOrUsername(
            [Values(TestUsername, TestUserEmail)] string emailOrUsername)
        {
            var env = new TestEnvironment(isResetLinkExpired: true);

            bool result = await env.Controller.ForgotPassword(emailOrUsername);

            Assert.That(result, Is.True);
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

            bool result = await env.Controller.ForgotPassword("user1");

            Assert.That(result, Is.False);
        }

        [Test]
        public async Task ResetPassword_IncorrectKey_PasswordNotSaved()
        {
            var env = new TestEnvironment();
            const string NewPassword = "NewPassword";

            bool result = await env.Controller.ResetPassword(TestResetPasswordKey + "bad", NewPassword);

            Assert.That(result, Is.False);
            UserEntity user = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(user.VerifyPassword(NewPassword), Is.False, "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_Expired_PasswordNotSaved()
        {
            var env = new TestEnvironment(isResetLinkExpired: true);
            const string NewPassword = "NewPassword";

            bool result = await env.Controller.ResetPassword(TestResetPasswordKey, NewPassword);

            Assert.That(result, Is.False);
            UserEntity user = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(user.VerifyPassword(NewPassword), Is.False, "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_PasswordSaved()
        {
            var env = new TestEnvironment();
            const string NewPassword = "N3wP@ssword";

            bool result = await env.Controller.ResetPassword(TestResetPasswordKey, NewPassword);

            Assert.That(result, Is.True);
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

            bool result = await env.Controller.ResetPassword(TestResetPasswordKey, "NewPassword");

            Assert.That(result, Is.True);

            result = await env.Controller.ResetPassword(TestResetPasswordKey, "NewPassword");

            Assert.That(result, Is.False);
        }

        [Test]
        public async Task SignUp_NewUserAdded()
        {
            var env = new TestEnvironment();

            string result = await env.Controller.SignUp("Test Sample Name", "password1234", "testeremail@gmail.com");

            Assert.That(result, Is.EqualTo("success"));
            Assert.That(env.Users.Query().Any(x => x.Email == "testeremail@gmail.com"), Is.True);
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
                Password = UserEntity.HashPassword("unimportant1234"),
                Email = "duplicate@example.com",
                CanonicalEmail = "duplicate@example.com",
                Active = true
            });
            // Duplicate emailid should result in an error
            string result = await env.Controller.SignUp("Non Duplicated Name", "unimportant1234",
                "DUPLICATE@example.com");

            Assert.That(result, Is.EqualTo("conflict"));
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
            string result = await env.Controller.SignUp("User Name", "unimportant1234", "me@example.com");

            Assert.That(result, Is.EqualTo("success"));
        }

        [Test]
        public async Task VerifyInvitedUser_NoUser_NotInvited()
        {
            var env = new TestEnvironment();
            bool result = await env.Controller.VerifyInvitedUser("me@example.com");
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task VerifyInvitedUser_UserExists_NotInvited()
        {
            var env = new TestEnvironment();
            env.Users.Add(new UserEntity
            {
                Id = "uniqueidforinviteduser",
                Name = "User Name",
                Password = "Password",
                Active = true,
                Email = "me@example.com",
                CanonicalEmail = "me@example.com",

            });
            bool result = await env.Controller.VerifyInvitedUser("me@example.com");
            Assert.That(result, Is.False);
        }

        [Test]
        public async Task VerifyInvitedUser_UserExists_Invited()
        {
            var env = new TestEnvironment();
            env.Users.Add(new UserEntity
            {
                Id = "uniqueidforinviteduser",
                Active = false,
                Email = "me@example.com",
                CanonicalEmail = "me@example.com",

            });
            bool result = await env.Controller.VerifyInvitedUser("me@example.com");
            Assert.That(result, Is.True);
        }

        [Test]
        public async Task VerifyEmail_SetsEmailVerified()
        {
            var env = new TestEnvironment();
            string userId = "emailneedsverificationuser";
            string validationKey = "validation_key_123";
            env.Users.Add(new UserEntity
            {
                Id = userId,
                Email = "me@example.com",
                CanonicalEmail = "me@example.com",
                EmailVerified = false,
                ValidationKey = validationKey,
                ValidationExpirationDate = DateTime.UtcNow.AddDays(7)
            });
            bool result = await env.Controller.VerifyEmail(validationKey);
            Assert.That(result, Is.True);
            UserEntity user = await env.Users.GetAsync(userId);
            Assert.That(user.EmailVerified, Is.True);
        }

        [Test]
        public async Task VerifyEmail_ExpiredLinkFails()
        {
            var env = new TestEnvironment();
            string userId = "expiredemailverificationlink";
            string validationKey = "validation_key_123";
            env.Users.Add(new UserEntity
            {
                Id = userId,
                Email = "me@example.com",
                CanonicalEmail = "me@example.com",
                EmailVerified = false,
                ValidationKey = validationKey,
                ValidationExpirationDate = DateTime.UtcNow.AddDays(-1)
            });
            bool result = await env.Controller.VerifyEmail(validationKey);
            Assert.That(result, Is.False);
            UserEntity user = await env.Users.GetAsync(userId);
            Assert.That(user.EmailVerified, Is.False);
        }

        [Test]
        public async Task SendEmailVerificationLink_OverwritesExistingValidationKey()
        {
            var env = new TestEnvironment();
            string userId = "existingvalidationkeyuser";
            string validationKey = "validation_key_123";
            env.Users.Add(new UserEntity
            {
                Id = userId,
                Email = "me@example.com",
                CanonicalEmail = "me@example.com",
                EmailVerified = false,
                ValidationKey = validationKey,
                ValidationExpirationDate = DateTime.UtcNow
            });
            string result = await env.Controller.SendEmailVerificationLink("me@example.com");
            Assert.AreEqual(result, "success");
            UserEntity user = await env.Users.GetAsync(userId);
            Assert.That(user.EmailVerified, Is.False);
            Assert.AreNotEqual(validationKey, user.ValidationKey);
            Assert.Greater(user.ValidationExpirationDate, DateTime.UtcNow.AddDays(6));
        }

        [Test]
        public async Task LinkAccount_CorrectPassword()
        {
            var env = new TestEnvironment();

            LinkAccountResult result = await env.Controller.LinkAccount(TestUsername, TestPassword);

            Assert.That(result.Success, Is.True);
            await env.ExternalService.Received().LogInAsync(TestUserId);
        }

        [Test]
        public async Task LinkAccount_CaseInsensitiveUsername()
        {
            var env = new TestEnvironment();

            LinkAccountResult result = await env.Controller.LinkAccount(TestUsername.ToUpperInvariant(), TestPassword);

            Assert.That(result.Success, Is.True);
            await env.ExternalService.Received().LogInAsync(TestUserId);
        }

        [Test]
        public async Task LinkAccount_CaseInsensitiveEmail()
        {
            var env = new TestEnvironment();

            LinkAccountResult result = await env.Controller.LinkAccount("ABC@fakegmail.com", TestPassword);

            Assert.That(result.Success, Is.True);
            await env.ExternalService.Received().LogInAsync(TestUserId);
        }

        [Test]
        public async Task LinkAccount_IncorrectPassword()
        {
            var env = new TestEnvironment();

            LinkAccountResult result = await env.Controller.LinkAccount(TestUsername, "wrong");

            Assert.That(result.Success, Is.False);
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
            await env.ExternalService.DidNotReceive().LogInAsync(TestUserId);
        }

        private class TestEnvironment : HttpTestEnvironmentBase
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
                            Password = UserEntity.HashPassword(TestPassword),
                            ResetPasswordKey =  TestResetPasswordKey,
                            ResetPasswordExpirationDate = isResetLinkExpired
                                ? DateTime.UtcNow.AddTicks(-1)
                                : DateTime.UtcNow.AddMinutes(2),
                            Email = TestUserEmail,
                            CanonicalEmail = UserEntity.CanonicalizeEmail(TestUserEmail)
                        }
                    });
                var siteOptions = Substitute.For<IOptions<SiteOptions>>();
                siteOptions.Value.Returns(new SiteOptions
                {
                    Name = "xForge",
                    Origin = new Uri("http://localhost")
                });

                EmailService = Substitute.For<IEmailService>();

                CaptchaOptions = Substitute.For<IOptions<GoogleCaptchaOptions>>();
                CaptchaOptions.Value.Returns(new GoogleCaptchaOptions());

                ExternalService = Substitute.For<IExternalAuthenticationService>();

                Controller = new IdentityRpcController(interaction, clientStore, Events, Users, siteOptions,
                    EmailService, CaptchaOptions, HttpContextAccessor, ExternalService);
            }

            public IEventService Events { get; }
            public IdentityRpcController Controller { get; }
            public MemoryRepository<UserEntity> Users { get; }
            public IEmailService EmailService { get; }
            public IOptions<GoogleCaptchaOptions> CaptchaOptions { get; }
            public IExternalAuthenticationService ExternalService { get; }
        }
    }
}
