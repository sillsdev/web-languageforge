using System.Threading.Tasks;

namespace SIL.XForge.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email, string subject, string body);
    }
}
