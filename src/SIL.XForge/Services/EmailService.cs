using System;
using MailKit;
using MailKit.Net.Smtp;
using MimeKit;
using SIL.XForge.Configuration;
using Microsoft.Extensions.Options;

namespace SIL.XForge.Services
{
    public class EmailService : IEmailService
    {

        private readonly IOptions<SiteOptions> _options;
        public EmailService(IOptions<SiteOptions> options)
        {
            _options = options;
        }

        public string SendEmail(string emailId, string subject, string body)
        {
            var siteOptions = _options.Value;
            if (siteOptions == null) return "Sorry, Email was not sent.";
            string fromAddress = "no-reply@" + siteOptions.Domain;
            string title = siteOptions.Name;
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress(title, fromAddress));
            mimeMessage.To.Add(new MailboxAddress("", emailId));
            mimeMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = body;
            mimeMessage.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                client.Connect(siteOptions.SmtpServer, Convert.ToInt32(siteOptions.PortNumber), false);
                client.Send(mimeMessage);
                client.Disconnect(true);
                return "Email has been sent successfully!";
            }
        }
    }
}
