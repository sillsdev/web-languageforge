using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class Resource : Identifiable<string>
    {
        public const string OwnerRelationship = "owner";

        [HasOne(OwnerRelationship)]
        public UserResource Owner { get; set; }
    }
}
