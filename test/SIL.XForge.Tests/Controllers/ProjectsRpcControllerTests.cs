using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using NSubstitute;
using NUnit.Framework;
using SIL.XForge.Configuration;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Services;

namespace SIL.XForge.Controllers
{
    [TestFixture]
    public class ProjectsRpcControllerTests
    {
        [Test]
        public async Task SendInvite_NoUser_InvitedEmail()
        {
            var env = new TestEnvironment();
            const string email = "abc1@example.com";
            Assert.That(env.Users.Query().Any(x => x.Email == email), Is.False);

            string result = await env.Controller.Invite(email);

            Assert.That(env.Users.Query().Any(x => x.Email == email), Is.True);
            Assert.That(result, Is.EqualTo("invited"));
            string subject = "You've been invited to the project [Project Name] on xForge";
            // Skip verification for the body, we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(email), Arg.Is(subject), Arg.Any<string>());
        }

        [Test]
        public async Task SendInvite_UserNoProjects_JoinedEmail()
        {
            var env = new TestEnvironment();
            const string email = "abc1@example.com";
            env.Users.Add(new[]
                {
                    new UserEntity
                    {
                        Id = "userWithNoProjects",
                        Email = email,
                        CanonicalEmail = email
                    }
                });
            Assert.That(env.Users.Query().Any(x => x.Email == email), Is.True);

            string result = await env.Controller.Invite(email);

            Assert.That(env.Users.Query().Any(x => x.Email == email), Is.True);
            Assert.That(result, Is.EqualTo("joined"));
            string subject = "You've been added to the project [Project Name] on xForge";
            // Skip verification for the body, we may change the content
            await env.EmailService.Received().SendEmailAsync(Arg.Is(email), Arg.Is(subject), Arg.Any<string>());
        }

        private class TestEnvironment
        {
            public TestEnvironment(bool isResetLinkExpired = false)
            {
                var userAccessor = Substitute.For<IUserAccessor>();
                userAccessor.Name.Returns("User");
                var httpRequestAccessor = Substitute.For<IHttpRequestAccessor>();

                Projects = new MemoryRepository<TestProjectEntity>(new[]
                {
                    new TestProjectEntity
                    {
                        Id = "project01",
                        ProjectName = "Project 1"
                    }
                });

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
                            Id = "user01",
                            Email = "abc@fakegmail.com",
                            CanonicalEmail = "abc@fakegmail.com"
                        }
                    });
                var options = Substitute.For<IOptions<SiteOptions>>();
                options.Value.Returns(new SiteOptions
                {
                    Name = "xForge",
                    Origin = new Uri("http://localhost")
                });

                EmailService = Substitute.For<IEmailService>();

                Controller = new TestProjectsRpcController(userAccessor, httpRequestAccessor, Projects, Users,
                    EmailService, options);
            }

            public TestProjectsRpcController Controller { get; }
            public MemoryRepository<TestProjectEntity> Projects { get; }
            public MemoryRepository<UserEntity> Users { get; }
            public IEmailService EmailService { get; }
        }
    }
}
