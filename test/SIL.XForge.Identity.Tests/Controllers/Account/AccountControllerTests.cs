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
                EmailOrUsername = "user",
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
                EmailOrUsername = "user",
                Password = "wrong",
                ReturnUrl = "https://beta.scriptureforge.local/home"
            };
            IActionResult result = await env.Controller.Login(model, "login");

            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.That(env.Controller.ModelState.ErrorCount, Is.EqualTo(1));
            await env.Events.Received().RaiseAsync(Arg.Any<UserLoginFailureEvent>());
        }

        [Test]
        public async Task ForgotPassword_CorrectUsernameOrEmail()
        {
            var env = new TestEnvironment();

            var model = new ForgotPasswordViewModel
            {
                EmailOrUsername = "user",
                EnableErrorMessage = false
            };
            IActionResult result = await env.Controller.ForgotPassword(model);

            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.IsTrue(model.EnableErrorMessage == false);

            UserEntity user = await env.Users.Query().SingleOrDefaultAsync(x => x.Username == model.EmailOrUsername);
            Assert.True(user.ResetPasswordKey != "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR/", "ResetPasswordKey not saved.");
            Assert.True(user.ResetPasswordExpirationDate != default(DateTime), "ResetPasswordExpirationDate not saved.");

            string emailId = "abc@fakegmail.com";
            string subject = "xForge Forgotten Password Verification";
            // Skip verification for the body, we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(emailId), Arg.Is(subject), Arg.Any<string>());
        }

        [Test]
        public async Task ForgotPassword_IncorrectUsernameOrEmail()
        {
            var env = new TestEnvironment();

            var model = new ForgotPasswordViewModel
            {
                EmailOrUsername = "user1",
                EnableErrorMessage = false
            };
            IActionResult result = await env.Controller.ForgotPassword(model);

            Assert.That(result, Is.TypeOf<ViewResult>());
            Assert.IsTrue(model.EnableErrorMessage == true);
        }

        [Test]
        public async Task ResetPassword_CorrectResetPasswordKey()
        {
            const string resetPasswordKey = "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR/";
            var env = new TestEnvironment();

            IActionResult result = await env.Controller.ResetPassword(resetPasswordKey);
            Assert.That(result, Is.TypeOf<ViewResult>());
            var viewResult = result as ViewResult;
            Assert.True(viewResult.ViewName == "ResetPassword");
        }

        [Test]
        public async Task ResetPassword_IncorrectResetPasswordKey()
        {
            const string resetPasswordKey = "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR";
            var env = new TestEnvironment();

            IActionResult result = await env.Controller.ResetPassword(resetPasswordKey);
            Assert.That(result, Is.TypeOf<RedirectResult>());
            var redirectResult = result as RedirectResult;
            Assert.True(redirectResult.Url == "Login");
        }

        [Test]
        public async Task ResetPassword_PasswordNotSaved()
        {
            var env = new TestEnvironment();

            var model = new ResetPasswordViewModel
            {
                Password = "NewPassword",
                ConfirmPassword = "NewPassword1"
            };
            UserEntity beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            IActionResult result = await env.Controller.ResetPassword(model);
            Assert.That(result, Is.TypeOf<ViewResult>());
            UserEntity afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.True(beforeSave.Password == afterSave.Password);
        }

        [Test]
        public async Task ResetPassword_PasswordSaved()
        {
            var env = new TestEnvironment();

            var model = new ResetPasswordViewModel
            {
                Username = "user",
                Password = "NewPassword",
                ConfirmPassword = "NewPassword"
            };
            UserEntity beforeSave = await env.Users.Query().SingleOrDefaultAsync();
            IActionResult result = await env.Controller.ResetPassword(model);
            Assert.That(result, Is.TypeOf<RedirectResult>());
            UserEntity afterSave = await env.Users.Query().SingleOrDefaultAsync();
            Assert.True(beforeSave.Password != afterSave.Password);
        }

        [Test]
        public async Task Register_NewUserAdded()
        {
            var env = new TestEnvironment();

            var model = new RegisterViewModel
            {
                Fullname = "testsamplename",
                Password = "password1234",
                Email = "testeremail@gmail.com"
            };

            IActionResult result = await env.Controller.Register(model, "/home");
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
                        Username = "user",
                        Email = "duplicate@fakegmail.com"
                    }
                });
            // Duplicate emailid should result in an error
            var model = new RegisterViewModel
            {
                Fullname = "Non Duplicated Name",
                Password = "unimportant1234",
                Email = "duplicate@fakegmail.com"
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
                Users = new MemoryRepository<UserEntity>(new[]
                    {
                        new UserEntity
                        {
                            Id = "user01",
                            Username = "user",
                            Password = BCrypt.Net.BCrypt.HashPassword("password", 7),
                            ResetPasswordKey =  "jGc6Qe4i1kgM+aA4LVczTJwfHx2YuDR/",
                            ResetPasswordExpirationDate = DateTime.Now,
                            Email = "abc@fakegmail.com"
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

                serviceProvider.GetService(typeof(IAuthenticationService)).Returns(AuthService);
                serviceProvider.GetService(typeof(ISystemClock)).Returns(new SystemClock());
                serviceProvider.GetService(typeof(IAuthenticationSchemeProvider)).Returns(schemeProvider);
                serviceProvider.GetService(typeof(IOptions<SiteOptions>)).Returns(options);

                serviceProvider.GetService(typeof(IEmailService)).Returns(EmailService);

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
            public MemoryRepository<UserEntity> Users { get; set; }
            public IEmailService EmailService { get; set; }

        }
    }
}
