using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class TextResource : ProjectDataResource
    {
        [Attr]
        public string Name { get; set; }
        [Attr(isImmutable: true)]
        public string BookId { get; set; }
    }
}
