using System;
using MailKit;
using MailKit.Net.Smtp;
using MimeKit;

namespace SIL.XForge.Services
{
    public class EmailService : IEmailService
    {
        public string SendEmail(string emailId, string subject, string body, string domain, string name, string smtpServer, string portNumber)
        {
            string fromAddress = "no-reply@" + domain;
            string title = name;
            var mimeMessage = new MimeMessage();
            mimeMessage.From.Add(new MailboxAddress(title, fromAddress));
            mimeMessage.To.Add(new MailboxAddress("", emailId));
            mimeMessage.Subject = subject;

            var bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = body;
            mimeMessage.Body = bodyBuilder.ToMessageBody();

            using (var client = new SmtpClient())
            {
                client.Connect(smtpServer, Convert.ToInt32(portNumber), false);
                client.Send(mimeMessage);
                client.Disconnect(true);
                return "Email has been sent successfully!";
            }
        }
    }
}
