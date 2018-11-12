using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    [Resource("users")]
    public abstract class UserResource : Resource
    {
        [Attr]
        public string Username { get; set; }
        [Attr]
        public string Name { get; set; }
        [Attr]
        public string Email { get; set; }
        [Attr(isImmutable: true)]
        public string CanonicalEmail { get; set; }
        [Attr]
        public string Password { get; set; }
        [Attr]
        public string ParatextId { get; set; }
        [Attr("paratext-username", isImmutable: true)]
        public string ParatextUsername { get; set; }
        [Attr("role")]
        public string Role { get; set; }

        [Attr("active")]
        public string Active { get; set; }
    }
}
