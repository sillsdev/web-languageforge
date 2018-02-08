using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexExample
    {
        public LexExample(string liftId = null, string guid = null)
        {
            LiftId = liftId;
            Guid = guid ?? System.Guid.NewGuid().ToString();
            TranslationGuid = System.Guid.NewGuid().ToString();
        }

        public string LiftId { get; protected set; }
        public LexMultiText Sentence { get; protected set; } = new LexMultiText();
        public LexMultiText Translation { get; protected set; } = new LexMultiText();
        public string TranslationGuid { get; protected set; }
        public Dictionary<string, object> CustomFields { get; protected set; } = new Dictionary<string, object>();
        public LexAuthorInfo AuthorInfo { get; protected set; } = new LexAuthorInfo();
        public string Guid { get; protected set; }

        public LexMultiText Reference { get; protected set; } = new LexMultiText();
    }
}
