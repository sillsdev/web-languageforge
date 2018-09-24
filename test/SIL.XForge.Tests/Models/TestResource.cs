using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class TestResource : Resource
    {
        [Attr("str")]
        public string Str { get; set; }
        [Attr("num")]
        public int Num { get; set; }

        [HasOne("user", withForeignKey: nameof(UserRef))]
        public UserResource User { get; set; }
        public string UserRef { get; set; }
    }
}
