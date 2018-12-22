using System;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    /// <summary>A Resource is what is sent between the server and the frontend. See also Entity.</summary>
    public abstract class Resource : Identifiable<string>, IResource
    {
        [Attr(isImmutable: true)]
        public DateTime DateModified { get; set; }
        [Attr(isImmutable: true)]
        public DateTime DateCreated { get; set; }
    }
}
