using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexEntry : EntityBase
    {
        public LexEntry()
        {
            Guid = System.Guid.NewGuid().ToString();
        }

        public bool IsDeleted { get; set; }
        public string Guid { get; protected set; }
        public int? DirtySR { get; protected set; }

        public LexMultiText Lexeme { get; protected set; } = new LexMultiText();
        public List<LexSense> Senses { get; protected set; } = new List<LexSense>();

        public LexAuthorInfo AuthorInfo { get; protected set; } = new LexAuthorInfo();
        public LexMultiText CitationForm { get; protected set; } = new LexMultiText();
        public Dictionary<string, object> CustomFields { get; protected set; } = new Dictionary<string, object>();
        public LexMultiText EntryBibliography { get; protected set; } = new LexMultiText();
        public LexMultiText EntryRestrictions { get; protected set; } = new LexMultiText();
        public LexMultiValue Environments { get; protected set; } = new LexMultiValue();
        public LexMultiText Etymology { get; protected set; } = new LexMultiText();
        public LexMultiText EtymologyGloss { get; protected set; } = new LexMultiText();
        public LexMultiText EtymologyComment { get; protected set; } = new LexMultiText();
        public LexMultiText EtymologySource { get; protected set; } = new LexMultiText();
        public LexMultiText LiteralMeaning { get; protected set; } = new LexMultiText();
        public LexValue Location { get; protected set; } = new LexValue();
        public string MercurialSha { get; set; }
        public string MorphologyType { get; set; } = "";
        public LexMultiText Note { get; protected set; } = new LexMultiText();
        public LexMultiText Pronunciation { get; protected set; } = new LexMultiText();
        public LexMultiText CvPattern { get; protected set; } = new LexMultiText();
        public LexMultiText Tone { get; protected set; } = new LexMultiText();
        public LexMultiText SummaryDefinition { get; protected set; } = new LexMultiText();
    }

}
