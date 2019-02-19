using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class QuestionResource : ProjectDataResource
    {
        [Attr(isImmutable: true)]
        public string Source { get; set; }
        [Attr]
        public VerseRefData ScriptureStart { get; set; }
        [Attr]
        public VerseRefData ScriptureEnd { get; set; }
        [Attr]
        public string Text { get; set; }
    }
}
