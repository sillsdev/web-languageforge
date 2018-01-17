using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexSense
    {
        public LexSense(string liftId = null, string guid = null)
        {
            LiftId = liftId;
            Guid = guid ?? System.Guid.NewGuid().ToString();
        }

        public string LiftId { get; protected set; }
        public string Guid { get; protected set; }
        public LexMultiText Definition { get; protected set; } = new LexMultiText();
        public LexMultiText Gloss { get; protected set; } = new LexMultiText();
        public List<LexPicture> Pictures { get; protected set; } = new List<LexPicture>();
        public LexValue PartOfSpeech { get; protected set; } = new LexValue();
        public LexMultiValue SemanticDomain { get; protected set; } = new LexMultiValue();
        public List<LexExample> Examples { get; protected set; } = new List<LexExample>();
        public Dictionary<string, object> CustomFields { get; protected set; } = new Dictionary<string, object>();
        public LexAuthorInfo AuthorInfo { get; protected set; } = new LexAuthorInfo();

        public LexMultiText ScientificName { get; protected set; } = new LexMultiText();
        public LexMultiText AnthropologyNote { get; protected set; } = new LexMultiText();
        public LexMultiText SenseBibliography { get; protected set; } = new LexMultiText();
        public LexMultiText DiscourseNote { get; protected set; } = new LexMultiText();
        public LexMultiText EncyclopedicNote { get; protected set; } = new LexMultiText();
        public LexMultiText GeneralNote { get; protected set; } = new LexMultiText();
        public LexMultiText GrammarNote { get; protected set; } = new LexMultiText();
        public LexMultiText PhonologyNote { get; protected set; } = new LexMultiText();
        public LexMultiText SenseRestrictions { get; protected set; } = new LexMultiText();
        public LexMultiText SemanticsNote { get; protected set; } = new LexMultiText();
        public LexMultiText SociolinguisticsNote { get; protected set; } = new LexMultiText();
        public LexMultiText Source { get; protected set; } = new LexMultiText();
        public LexMultiValue Usages { get; protected set; } = new LexMultiValue();
        public LexMultiValue ReversalEntries { get; protected set; } = new LexMultiValue();
        public LexValue SenseType { get; protected set; } = new LexValue();
        public LexMultiValue AcademicDomains { get; protected set; } = new LexMultiValue();
        public LexMultiValue AnthropologyCategories { get; protected set; } = new LexMultiValue();
        public LexMultiText SenseImportResidue { get; protected set; } = new LexMultiText();
        public LexMultiValue Status { get; protected set; } = new LexMultiValue();
    }
}
