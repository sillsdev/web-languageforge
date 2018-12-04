using System;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public abstract class Resource : Identifiable<string>, IResource
    {
        [Attr(isImmutable: true)]
        public DateTime DateModified { get; set; }
        [Attr(isImmutable: true)]
        public DateTime DateCreated { get; set; }
    }
}
