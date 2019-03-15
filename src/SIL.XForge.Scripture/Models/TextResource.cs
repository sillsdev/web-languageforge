using System.Collections.Generic;
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
        [Attr(isImmutable: true, isFilterable: false, isSortable: false)]
        public IReadOnlyList<Chapter> Chapters { get; set; }
    }
}
