using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexConfigOptionList : LexConfig
    {
        private static readonly Dictionary<string, string> FlexOptionListCodes = new Dictionary<string, string>
        {
            { LexConfig.Pos, "grammatical-info" },
            { LexConfig.Semdom, "semantic-domain-ddp4" },
            { LexConfig.Environments, LexConfig.Environments },
            { LexConfig.Location, "location" },
            { LexConfig.Usages, "usage-type" },
            { LexConfig.ReversalEntries, "reversal-type" },
            { LexConfig.SenseType, "sense-type" },
            { LexConfig.AcademicDomains, "domain-type" },
            { LexConfig.AnthropologyCategories, "anthro-code" },
            { LexConfig.Status, "status" }
        };

        private static readonly Dictionary<string, string> FlexOptionListNames = new Dictionary<string, string>
        {
            { "grammatical-info", "Part of Speech" },
            { "semantic-domain-ddp4", "Semantic Domain" },
            { "domain-type", "Academic Domains" },
            { LexConfig.Environments, "Environments" },
            { "location", "Location" },
            { "usage-type", "Usages" },
            { "reversal-type", "Reversal Entries" },
            { "sense-type", "Type" },
            { "anthro-code", "Anthropology Categories" },
            { "do-not-publish-in", "Publish In" },
            { "status", "Status" },

            { "etymology", "Etymology" },
            { "lexical-relation", "Lexical Relation" },
            { "note-type", "Note Type" },
            { "paradigm", "Paradigm" },
            { "users", "Users" },
            { "translation-type", "Translation Type" },
            { "from-part-of-speech", "From Part of Speech" },
            { "morph-type", "Morph Type" },
            { "noun-slot", "Noun Slot" },
            { "verb-slot", "Verb Slot" },
            { "stative-slot", "Stative Slot" },
            { "noun-infl-class", "Noun Inflection Class" },
            { "verb-infl-class", "Verb Inflection Class" }
        };

        public LexConfigOptionList(string fieldName, bool hideIfEmpty = false)
        {
            Type = OptionList;

            HideIfEmpty = hideIfEmpty;

            if (!FlexOptionListCodes.TryGetValue(fieldName, out string code))
                code = fieldName;
            ListCode = code;

            if (!FlexOptionListNames.TryGetValue(code, out string label))
                label = code;
            Label = label;
        }

        public LexConfigOptionList()
        {
            Type = OptionList;
        }

        public string ListCode { get; set; } = "";
    }
}
