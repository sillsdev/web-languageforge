namespace SIL.XForge.Identity.Models
{
    public class LogInResult : IdentityResult
    {
        public bool IsReturnUrlTrusted { get; set; }
    }
}
