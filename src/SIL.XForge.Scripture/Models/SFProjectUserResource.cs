using System.Collections.Generic;
using JsonApiDotNetCore.Models;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectUserResource : ProjectUserResource
    {
        [Attr]
        public string SelectedTask { get; set; }
        [Attr]
        public TranslateProjectUserConfig TranslateConfig { get; set; }
        [Attr(isFilterable: false, isSortable: false)]
        public List<string> QuestionRefsRead { get; set; }
        [Attr(isFilterable: false, isSortable: false)]
        public List<string> AnswerRefsRead { get; set; }
        [Attr(isFilterable: false, isSortable: false)]
        public List<string> CommentRefsRead { get; set; }
    }
}
