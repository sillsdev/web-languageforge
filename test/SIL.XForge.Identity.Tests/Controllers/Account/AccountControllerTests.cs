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
using SIL.XForge.Services;
using Microsoft.Extensions.Options;
using SIL.XForge.Configuration;
using SIL.XForge.Identity.Configuration;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Routing;

namespace SIL.XForge.Identity.Controllers.Account
{

    [TestFixture]
    public class AccountControllerTests
    {
        private const string TestUserId = "user01";
        private const string TestUsername = "user";
        private const string TestPassword = "pa$$w0rd";
        private const string TestResetPasswordKey = "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR9";
        private const string TestUserEmail = "abc@fakegmail.com";
        private const string TestReturnUrl = "http://beta.scriptureforge.local/home";
        private const string ShowMessageKey = "showMessage";

        [Test]
        public async Task Login_CorrectPassword()
        {
            var env = new TestEnvironment();

            var model = new LoginInputModel
            {
                EmailOrUsername = TestUsername,
                Password = TestPassword,
                ReturnUrl = TestReturnUrl
            };
            var result = await env.Controller.Login(model, "login");

            Assert.That(result, Is.TypeOf<RedirectResult>());
            var redirectResult = (RedirectResult) result;
            Assert.That(redirectResult.Url, Is.EqualTo(TestReturnUrl));
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginSuccessEvent>());
            await env.AuthService.Received().SignInAsync(Arg.Any<HttpContext>(),
                CookieAuthenticationDefaults.AuthenticationScheme,
                Arg.Is<ClaimsPrincipal>(u => u.GetSubjectId() == TestUserId),
                Arg.Any<AuthenticationProperties>());
            Assert.Less(env.Users.Query().First(u => u.Username == TestUsername).ResetPasswordExpirationDate, DateTime.UtcNow,
                "successful login should invalidate pasword reset");
        }

        [Test]
        public async Task Login_IncorrectPassword()
        {
            var env = new TestEnvironment();

            var model = new LoginInputModel
            {
                EmailOrUsername = TestUsername,
                Password = "wrong",
                ReturnUrl = TestReturnUrl
            };
            var result = await env.Controller.Login(model, "login");

            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.That(env.Controller.ModelState.ErrorCount, Is.EqualTo(1));
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
            Assert.Greater(env.Users.Query().First(u => u.Username == TestUsername).ResetPasswordExpirationDate, DateTime.UtcNow,
                "Unsuccessful login should not invalidate pasword reset");
        }

        [Test]
        public async Task ForgotPassword_CorrectEmailOrUsername(
            [Values(TestUsername, TestUserEmail)] string emailOrUsername)
        {
            var env = new TestEnvironment(isResetLinkExpired: true);

            var model = new ForgotPasswordViewModel
            {
                EmailOrUsername = emailOrUsername,
                EnableErrorMessage = false
            };
            var result = (RedirectToActionResult) await env.Controller.ForgotPassword(model);
            Assert.AreEqual("Account", result.ControllerName);
            Assert.AreEqual("Login", result.ActionName);
            Assert.IsFalse(model.EnableErrorMessage);

            var user = await env.Users.Query().SingleOrDefaultAsync(
                x => x.Username == model.EmailOrUsername || x.Email == model.EmailOrUsername);
            Assert.That(user.ResetPasswordKey, Is.Not.EqualTo(TestResetPasswordKey), "ResetPasswordKey not updated.");
            Assert.That(user.ResetPasswordExpirationDate, Is.GreaterThan(DateTime.UtcNow), "ResetPasswordExpirationDate expired very quickly!");

            const string subject = "xForge Forgotten Password Verification";
            // Skip verification for the body; we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(TestUserEmail), Arg.Is(subject), Arg.Any<string>());
        }

        [Test]
        public async Task ForgotPassword_IncorrectEmailOrUsername()
        {
            var env = new TestEnvironment();

            var model = new ForgotPasswordViewModel
            {
                EmailOrUsername = "user1",
                EnableErrorMessage = false
            };
            var result = await env.Controller.ForgotPassword(model);

            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.IsTrue(model.EnableErrorMessage);
        }

        [Test]
        public async Task ResetPassword_CorrectResetPasswordKey()
        {
            const string resetPasswordKey = TestResetPasswordKey;
            var env = new TestEnvironment();

            var result = await env.Controller.ResetPassword(resetPasswordKey);
            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.True(((ViewResult)result).ViewName == "ResetPassword", "valid token should allow user to reset password");
        }

        [Test]
        public async Task ResetPassword_IncorrectResetPasswordKey()
        {
            const string resetPasswordKey = "not" + TestResetPasswordKey;
            var env = new TestEnvironment();

            var result = (RedirectToActionResult) await env.Controller.ResetPassword(resetPasswordKey);
            Assert.AreEqual("Account", result.ControllerName);
            Assert.AreEqual("Login", result.ActionName, "bad link should redirect to login");
        }

        [Test]
        public async Task ResetPassword_ExpiredResetPasswordKey()
        {
            const string resetPasswordKey = TestResetPasswordKey;
            var env = new TestEnvironment(isResetLinkExpired: true);

            var result = (RedirectToActionResult) await env.Controller.ResetPassword(resetPasswordKey);
            Assert.AreEqual("Account", result.ControllerName);
            Assert.AreEqual("Login", result.ActionName, "bad link should redirect to login");
            StringAssert.Contains("expired", env.Controller.TempData[ShowMessageKey].ToString(), "user should be informed that the link is expired");
        }

        [Test]
        public async Task ResetPassword_NoUsername_PasswordNotSaved()
        {
            var env = new TestEnvironment();

            var model = new ResetPasswordViewModel
            {
                Password = "NewPassword",
                ConfirmPassword = "NewPassword",
                ResetToken = TestResetPasswordKey
            };
            var beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            var result = (RedirectToActionResult) await env.Controller.ResetPassword(model);
            Assert.AreEqual("Account", result.ControllerName);
            Assert.AreEqual("Login", result.ActionName, "bad username should redirect to login");
            var afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(afterSave.Password, Is.EqualTo(beforeSave.Password), "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_MismatchedPasswords_PasswordNotSaved()
        {
            var env = new TestEnvironment();

            var model = new ResetPasswordViewModel
            {
                Username = TestUsername,
                Password = "NewPassword",
                ConfirmPassword = "NewPassword1",
                ResetToken = TestResetPasswordKey
            };
            var beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            var result = await env.Controller.ResetPassword(model);
            Assert.That(result, Is.TypeOf<ViewResult>(), "User should have a chance to try again");
            var afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(afterSave.Password, Is.EqualTo(beforeSave.Password), "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_IncorrectResetKey_PasswordNotSaved()
        {
            var env = new TestEnvironment();

            var model = new ResetPasswordViewModel
            {
                Username = TestUsername,
                Password = "NewPassword",
                ConfirmPassword = "NewPassword",
                ResetToken = TestResetPasswordKey + "bad"
            };
            var beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            var result = await env.Controller.ResetPassword(model);
            Assert.That(result, Is.TypeOf<RedirectToActionResult>());
            var afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(afterSave.Password, Is.EqualTo(beforeSave.Password), "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_ExpiredResetKey_PasswordNotSaved()
        {
            var env = new TestEnvironment(isResetLinkExpired: true);

            var model = new ResetPasswordViewModel
            {
                Username = TestUsername,
                Password = "NewPassword",
                ConfirmPassword = "NewPassword",
                ResetToken = TestResetPasswordKey
            };
            var beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            var result = await env.Controller.ResetPassword(model);
            Assert.That(result, Is.TypeOf<RedirectToActionResult>());
            var afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(afterSave.Password, Is.EqualTo(beforeSave.Password), "Password should not have changed");
        }

        [Test]
        public async Task ResetPassword_PasswordSaved()
        {
            var env = new TestEnvironment();
            const string newPassword = "N3wP@ssword";

            var model = new ResetPasswordViewModel
            {
                Username = TestUsername,
                Password = newPassword,
                ConfirmPassword = newPassword,
                ResetToken = TestResetPasswordKey
            };
            var beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            var result = await env.Controller.ResetPassword(model);
            Assert.That(result, Is.TypeOf<RedirectToActionResult>());
            var afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(afterSave.Password, Is.Not.EqualTo(beforeSave.Password), "Password should have been updated");
        }

        [Test]
        public async Task ResetPassword_LinkWorksOnlyOnce()
        {
            var env = new TestEnvironment();

            var model = new ResetPasswordViewModel
            {
                Username = TestUsername,
                Password = "NewPassword",
                ConfirmPassword = "NewPassword",
                ResetToken = TestResetPasswordKey
            };
            var beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            await env.Controller.ResetPassword(model);
            var afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.That(beforeSave.Password, Is.Not.EqualTo(afterSave.Password), "first reset should work");
            var result = (RedirectToActionResult) await env.Controller.ResetPassword(TestResetPasswordKey);
            Assert.AreEqual("Account", result.ControllerName);
            Assert.AreEqual("Login", result.ActionName, "bad link should redirect to login");
        }

        [Test]
        public async Task Register_NewUserAdded()
        {
            var env = new TestEnvironment();

            var model = new RegisterViewModel
            {
                Fullname = "Test Sample Name",
                Password = "password1234",
                Email = "testeremail@gmail.com"
            };

            var result = await env.Controller.Register(model, "/home");
            Assert.That(result, Is.Not.Null);
            Assert.That(env.Controller.ModelState.ErrorCount, Is.EqualTo(0));

            Assert.That(env.Users.Query().Any(x => x.Email == model.Email), Is.True);
        }

        [Test]
        public async Task Register_DuplicateEmailOrUserRejected()
        {
            var env = new TestEnvironment();

            env.Users.Add(new[]
                {
                    new UserEntity
                    {
                        Id = "uniqueidwithdupemailid",
                        Username = TestUsername,
                        Email = "duplicate@fakegmail.com"
                    }
                });
            // Duplicate emailid should result in an error
            var model = new RegisterViewModel
            {
                Fullname = "Non Duplicated Name",
                Password = "unimportant1234",
                Email = "DUPLICATE@fakegmail.com"
            };

            var result = await env.Controller.Register(model, "/home");
            Assert.That(result, Is.Not.Null);
            Assert.That(env.Controller.ModelState.ErrorCount, Is.EqualTo(1));

            // Duplicate user should result in an error
            model = new RegisterViewModel
            {
                Fullname = "Non Duplicated Name",
                Password = "unimportant1234",
                Email = "notaduplicate@fakegmail.com"
            };

            result = await env.Controller.Register(model, "/home");
            Assert.That(result, Is.Not.Null);
            Assert.That(env.Controller.ModelState.ErrorCount, Is.EqualTo(1));
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
                Users = new MemoryRepository<UserEntity>(new[]
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
                            Email = TestUserEmail
                        }
                    });
                AuthService = Substitute.For<IAuthenticationService>();
                var serviceProvider = Substitute.For<IServiceProvider>();
                var options = Substitute.For<IOptions<SiteOptions>>();
                options.Value.Returns(new SiteOptions
                    {
                        Name = "xForge",
                        Domain = "localhost"
                    });

                GoogleCaptchaOptions captchaOptions = new GoogleCaptchaOptions
                {
                    CaptchaId = "mockKey",
                    CaptchaSecret = "mockSecret"
                };

                var captcha = Substitute.For<IOptions<GoogleCaptchaOptions>>();
                captcha.Value.Returns(captchaOptions);

                EmailService = Substitute.For<IEmailService>();

                var urlHelperFactory = Substitute.For<IUrlHelperFactory>();

                serviceProvider.GetService(typeof(IAuthenticationService)).Returns(AuthService);
                serviceProvider.GetService(typeof(ISystemClock)).Returns(new SystemClock());
                serviceProvider.GetService(typeof(IAuthenticationSchemeProvider)).Returns(schemeProvider);
                serviceProvider.GetService(typeof(IOptions<SiteOptions>)).Returns(options);

                serviceProvider.GetService(typeof(IEmailService)).Returns(EmailService);
                serviceProvider.GetService(typeof(IUrlHelperFactory)).Returns(urlHelperFactory);

                Controller = new AccountController(interaction, clientStore, schemeProvider, Events, Users, options,
                    EmailService, captcha)
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
            public MemoryRepository<UserEntity> Users { get; }
            public IEmailService EmailService { get; }

        }
    }
}
