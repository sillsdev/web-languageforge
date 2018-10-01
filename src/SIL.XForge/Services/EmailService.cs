using System;
using MailKit;
using MailKit.Net.Smtp;
using MimeKit;
using SIL.XForge.Configuration;

namespace SIL.XForge.Services
{
    public class EmailService : IEmailService
    {

        private readonly SiteOptions _siteOptions;
        public EmailService(SiteOptions siteOptions)
        {
            _siteOptions = siteOptions;
        }

        public string SendEmail(string emailId, string subject, string body)
        {
            if (_siteOptions == null) return "Sorry, Email was not sent.";
            string fromAddress = "no-reply@" + _siteOptions.Domain;
            string title = _siteOptions.Name;
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress(title, fromAddress));
            mimeMessage.To.Add(new MailboxAddress("", emailId));
            mimeMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = body;
            mimeMessage.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                client.Connect(_siteOptions.SmtpServer, Convert.ToInt32(_siteOptions.PortNumber), false);
                client.Send(mimeMessage);
                client.Disconnect(true);
                return "Email has been sent successfully!";
            }
        }
    }
}
