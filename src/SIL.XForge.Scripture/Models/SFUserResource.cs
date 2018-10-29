using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFUserResource : UserResource
    {
        [HasMany("projects")]
        [SchemaInfo(Inverse = nameof(SFProjectUserResource.User), IsDependent = true)]
        public IReadOnlyList<SFProjectUserResource> Projects { get; set; }
    }
}
