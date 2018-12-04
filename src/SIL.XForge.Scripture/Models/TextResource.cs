using JsonApiDotNetCore.Models;

namespace SIL.XForge.Scripture.Models
{
    public class TextResource : SFProjectDataResource
    {
        [Attr]
        public string Name { get; set; }
        [Attr(isImmutable: true)]
        public string BookId { get; set; }
    }
}
