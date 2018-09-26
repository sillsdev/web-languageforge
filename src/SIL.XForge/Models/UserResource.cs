using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class UserResource : Resource
    {
        [Attr("username")]
        public string Username { get; set; }
        [Attr("name")]
        public string Name { get; set; }
        [Attr("email")]
        public string Email { get; set; }
        [Attr("password")]
        public string Password { get; set; }
        [Attr("paratext-username", isImmutable: true)]
        public string ParatextUsername { get; set; }
    }
}
