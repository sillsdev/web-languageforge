using System.Threading.Tasks;

namespace SIL.XForge.Identity.Services
{
    public interface IExternalAuthenticationService
    {
         Task<string> LogInAsync(string userId = null);
         Task<(bool Success, string ReturnUrl)> SignUpAsync();
    }
}
