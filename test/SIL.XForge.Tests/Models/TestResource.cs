using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class TestResource : Resource
    {
        public const string UserRelationship = "user";

        [Attr("str")]
        public string Str { get; set; }
        [Attr("num")]
        public int Num { get; set; }

        [HasOne(UserRelationship, withForeignKey: nameof(UserRef))]
        public UserResource User { get; set; }
        public string UserRef { get; set; }
    }
}
