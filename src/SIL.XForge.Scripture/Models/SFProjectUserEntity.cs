using System.Collections.Generic;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectUserEntity : ProjectUserEntity
    {
        public string SelectedTask { get; set; }
        public TranslateProjectUserConfig TranslateConfig { get; set; } = new TranslateProjectUserConfig();
        public List<string> QuestionRefsRead { get; protected set; } = new List<string>();
        public List<string> AnswerRefsRead { get; protected set; } = new List<string>();
        public List<string> CommentRefsRead { get; protected set; } = new List<string>();
    }
}
