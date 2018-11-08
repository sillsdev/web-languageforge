namespace SIL.XForge.Identity.Models
{
    public class LogInParams
    {
        public string User { get; set; }
        public string Password { get; set; }
        public bool RememberLogIn { get; set; }
        public string ReturnUrl { get; set; }
    }
}
