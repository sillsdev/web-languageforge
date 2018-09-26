namespace SIL.XForge.Services
{
    public interface IEmailService
    {
        string SendEmail(string emailId, string subject, string body, string domain, string name, string smtpServer, string portNumber);
    }
}
