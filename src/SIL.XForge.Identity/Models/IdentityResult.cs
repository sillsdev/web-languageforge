namespace SIL.XForge.Identity.Models
{
    public class IdentityResult
    {
        public IdentityResult(bool success = false)
        {
            Success = success;
        }

        public bool Success { get; set; }
    }
}
