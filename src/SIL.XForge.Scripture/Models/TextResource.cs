using JsonApiDotNetCore.Models;

namespace SIL.XForge.Scripture.Models
{
    public class TextResource : SFProjectDataResource
    {
        [Attr("name")]
        public string Name { get; set; }
        [Attr("book-id", isImmutable: true)]
        public string BookId { get; set; }
    }
}
