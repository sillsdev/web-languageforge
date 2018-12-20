using System;
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
        [Attr(isImmutable: true)]
        public string EmailVerified { get; set; }
        [Attr]
        public string GoogleId { get; set; }
        [Attr]
        public string Password { get; set; }
        [Attr]
        public string ParatextId { get; set; }
        [Attr]
        public string Role { get; set; }
        [Attr]
        public bool Active { get; set; }
        [Attr]
        public string AvatarUrl { get; set; }
        [Attr]
        public string MobilePhone { get; set; }
        [Attr]
        public string ContactMethod { get; set; }
        [Attr]
        public DateTime Birthday { get; set; }
        [Attr]
        public string Gender { get; set; }
    }
}
