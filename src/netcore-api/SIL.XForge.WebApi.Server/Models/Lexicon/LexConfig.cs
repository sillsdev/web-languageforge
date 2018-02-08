namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public abstract class LexConfig
    {
        // config types
        public const string FieldList = "fields";
        public const string MultiText = "multitext";
        public const string MultiParagraph = "multiparagraph";
        public const string OptionList = "optionlist";
        public const string MultiOptionList = "multioptionlist";

        // fields
        public const string Lexeme = "lexeme";
        public const string Definition = "definition";
        public const string Gloss = "gloss";
        public const string Pos = "partOfSpeech";
        public const string Pictures = "pictures";
        public const string Semdom = "semanticDomain";
        public const string ExampleSentence = "sentence";
        public const string ExampleTranslation = "translation";

        // less common FLEx fields
        public const string CitationForm = "citationForm";
        public const string Environments = "environments";
        public const string Pronunciation = "pronunciation";
        public const string CVPattern = "cvPattern";
        public const string Tone = "tone";
        public const string Location = "location";
        public const string Etymology = "etymology";
        public const string EtymologyGloss = "etymologyGloss";
        public const string EtymologyComment = "etymologyComment";
        public const string EtymologySource = "etymologySource";
        public const string Note = "note";
        public const string LiteralMeaning = "literalMeaning";
        public const string EntryBibliography = "entryBibliography";
        public const string EntryRestrictions = "entryRestrictions";
        public const string SummaryDefinition = "summaryDefinition";
        public const string EntryImportResidue = "entryImportResidue";

        public const string ScientificName = "scientificName";
        public const string AnthropologyNote = "anthropologyNote";
        public const string SenseBibliography = "senseBibliography";
        public const string DiscourseNote = "discourseNote";
        public const string EncyclopedicNote = "encyclopedicNote";
        public const string GeneralNote ="generalNote";
        public const string GrammarNote = "grammarNote";
        public const string PhonologyNote = "phonologyNote";
        public const string SenseRestrictions = "senseRestrictions";
        public const string SemanticsNote = "semanticsNote";
        public const string SociolinguisticsNote = "sociolinguisticsNote";
        public const string Source = "source";
        public const string Usages = "usages";
        public const string ReversalEntries = "reversalEntries";
        public const string SenseType = "senseType";
        public const string AcademicDomains = "academicDomains";
        public const string AnthropologyCategories = "anthropologyCategories";
        public const string SenseImportResidue = "senseImportResidue";
        public const string Status = "status";

        public const string Reference = "reference";

        // field lists
        public const string SensesList = "senses";
        public const string ExamplesList = "examples";
        //public const string CustomFieldsList = "customFields";

        // comments
        public const string CommentsList = "comments";
        public const string RepliesList = "replies";

        public string Type { get; protected set; }
        public string Label { get; set; }
        public bool HideIfEmpty { get; set; }

    }
}
