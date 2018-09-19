namespace SIL.XForge.Configuration
{
    public class SecurityOptions
    {
        public bool UseDeveloperSigningCredential { get; set; } = false;
        public string SigningCredential { get; set; }
    }
}
