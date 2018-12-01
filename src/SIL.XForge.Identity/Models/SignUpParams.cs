namespace SIL.XForge.Identity.Models
{
    public class SignUpParams
    {
        public string Name { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Recaptcha { get; set; }
    }
}
