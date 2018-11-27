namespace SIL.XForge.Identity.Models
{
    public class SendInviteResult : IdentityResult
    {
        public bool IsAlreadyInProject { get; set; }
        public string EmailTypeSent { get; set; }
    }
}
