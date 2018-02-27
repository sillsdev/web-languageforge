using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexConfiguration
    {
        public LexConfiguration()
        {
            Tasks = new Dictionary<string, LexTask>
            {
                { LexTask.View, new LexTask() },
                { LexTask.Dashboard, new LexTaskDashboard() },
                { LexTask.GatherTexts, new LexTask() },
                { LexTask.Semdom, new LexTaskSemdom() },
                { LexTask.Wordlist, new LexTask() },
                { LexTask.Dbe, new LexTask() },
                { LexTask.AddMeanings, new LexTask() },
                { LexTask.AddGrammar, new LexTask() },
                { LexTask.AddExamples, new LexTask() },
                { LexTask.Review, new LexTask() },
                { LexTask.ImportExport, new LexTask() },
                { LexTask.Configuration, new LexTask() }
            };

            Entry = new LexConfigFieldList
            {
                FieldOrder =
                {
                    LexConfig.Lexeme,
                    LexConfig.CitationForm,
                    // LexConfig.Environments, // Disabled 05-2016
                    LexConfig.Pronunciation,
                    LexConfig.CVPattern,
                    LexConfig.Tone,
                    LexConfig.Location,
                    LexConfig.Etymology,
                    LexConfig.EtymologyGloss,
                    LexConfig.EtymologyComment,
                    LexConfig.EtymologySource,
                    LexConfig.Note,
                    LexConfig.LiteralMeaning,
                    LexConfig.EntryBibliography,
                    LexConfig.EntryRestrictions,
                    LexConfig.SummaryDefinition,
                    LexConfig.EntryImportResidue,

                    LexConfig.SensesList
                },
                Fields =
                {
                    { LexConfig.Lexeme, new LexConfigMultiText("Word", "th") },
                    // { LexConfig.CustomFieldsList, new LexConfigFieldList() },
                    { LexConfig.SensesList, new LexConfigFieldList
                        {
                            FieldOrder =
                            {
                                LexConfig.Definition,
                                LexConfig.Gloss,
                                LexConfig.Pictures,
                                LexConfig.Pos,
                                LexConfig.Semdom,
                                LexConfig.ScientificName,
                                LexConfig.AnthropologyNote,
                                LexConfig.SenseBibliography,
                                LexConfig.DiscourseNote,
                                LexConfig.EncyclopedicNote,
                                LexConfig.GeneralNote,
                                LexConfig.GrammarNote,
                                LexConfig.PhonologyNote,
                                LexConfig.SenseRestrictions,
                                LexConfig.SemanticsNote,
                                LexConfig.SociolinguisticsNote,
                                LexConfig.Source,
                                LexConfig.Usages,
                                // LexConfig.ReversalEntries, // Disabled 05-2016
                                LexConfig.SenseType,
                                LexConfig.AcademicDomains,
                                LexConfig.AnthropologyCategories,
                                LexConfig.SenseImportResidue,
                                LexConfig.Status,
                                LexConfig.ExamplesList
                            },
                            Fields =
                            {
                                { LexConfig.Definition, new LexConfigMultiText("Definition", "en") },
                                { LexConfig.Pos, new LexConfigOptionList(LexConfig.Pos) },
                                { LexConfig.Semdom, new LexConfigMultiOptionList(LexConfig.Semdom) },
                                { LexConfig.ExamplesList, new LexConfigFieldList
                                    {
                                        FieldOrder =
                                        {
                                            LexConfig.ExampleSentence,
                                            LexConfig.ExampleTranslation,
                                            LexConfig.Reference
                                        },
                                        Fields =
                                        {
                                            { LexConfig.ExampleSentence, new LexConfigMultiText("Sentence", "th") },
                                            { LexConfig.ExampleTranslation, new LexConfigMultiText("Translation", "en") },
                                            // { LexConfig.CustomFieldsList, new LexConfigFieldList() },

                                            // Configuration for less common fields (mostly used in FLEx are defined below)
                                            { LexConfig.Reference, new LexConfigMultiText("Reference", "en", true) }
                                        }
                                    }
                                },
                                // { LexConfig.CustomFieldsList, new LexConfigFieldList() },

                                // Configuration for less common fields (mostly used in FLEx are defined below)
                                { LexConfig.Gloss, new LexConfigMultiText("Gloss", "en", true) },
                                { LexConfig.Pictures, new LexConfigPictures() { HideIfEmpty = true } },
                                { LexConfig.ScientificName, new LexConfigMultiText("Scientific Name", "en", true) },
                                { LexConfig.AnthropologyNote, new LexConfigMultiText("Anthropology Note", "en", true) },
                                { LexConfig.SenseBibliography, new LexConfigMultiText("Bibliography", "en", true) },
                                { LexConfig.DiscourseNote, new LexConfigMultiText("Discourse Note", "en", true) },
                                { LexConfig.EncyclopedicNote, new LexConfigMultiText("Encyclopedic Note", "en", true) },
                                { LexConfig.GeneralNote, new LexConfigMultiText("General Note", "en", true) },
                                { LexConfig.GrammarNote, new LexConfigMultiText("Grammar Note", "en", true) },
                                { LexConfig.PhonologyNote, new LexConfigMultiText("Phonology Note", "en", true) },
                                { LexConfig.SenseRestrictions, new LexConfigMultiText("Restrictions", "en", true) },
                                { LexConfig.SemanticsNote, new LexConfigMultiText("Semantics Note", "en", true) },
                                { LexConfig.SociolinguisticsNote, new LexConfigMultiText("Sociolinguistics Note", "en", true) },
                                { LexConfig.Source, new LexConfigMultiText("Source", "en", true) },
                                { LexConfig.Usages, new LexConfigMultiOptionList(LexConfig.Usages, true) },
                                // { LexConfig.ReversalEntries, new LexConfigMultiOptionList(LexConfig.ReversalEntries, true) }, // Disabled 05-2016
                                { LexConfig.SenseType, new LexConfigOptionList(LexConfig.SenseType, true) },
                                { LexConfig.AcademicDomains, new LexConfigMultiOptionList(LexConfig.AcademicDomains, true) },
                                { LexConfig.AnthropologyCategories, new LexConfigMultiOptionList(LexConfig.AnthropologyCategories, true) },
                                { LexConfig.SenseImportResidue, new LexConfigMultiText("Import Residue", "en", true) },
                                { LexConfig.Status, new LexConfigOptionList(LexConfig.Status, true) }
                            }
                        }
                    },

                    // Configuration for less common fields (mostly used in FLEx are defined below)
                    { LexConfig.CitationForm, new LexConfigMultiText("Citation Form", "th", true) },
                    // { LexConfig.Environments, new LexConfigMultiOptionList(LexConfig.Environments, true) }, // Disabled 05-2016
                    { LexConfig.Pronunciation, new LexConfigMultiText("Pronunciation", "en", true) },
                    { LexConfig.CVPattern, new LexConfigMultiText("CV Pattern", "en", true) },
                    { LexConfig.Tone, new LexConfigMultiText("Tone", "en", true) },
                    { LexConfig.Location, new LexConfigOptionList(LexConfig.Location, true) },
                    { LexConfig.Etymology, new LexConfigMultiText("Etymology", "en", true) },
                    { LexConfig.EtymologyGloss, new LexConfigMultiText("Etymology Gloss", "en", true) },
                    { LexConfig.EtymologyComment, new LexConfigMultiText("Etymology Comment", "en", true) },
                    { LexConfig.EtymologySource, new LexConfigMultiText("Etymology Source", "en", true) },
                    { LexConfig.Note, new LexConfigMultiText("Note", "en", true) },
                    { LexConfig.LiteralMeaning, new LexConfigMultiText("Literal Meaning", "en", true) },
                    { LexConfig.EntryBibliography, new LexConfigMultiText("Bibliography", "en", true) },
                    { LexConfig.EntryRestrictions, new LexConfigMultiText("Restrictions", "en", true) },
                    { LexConfig.SummaryDefinition, new LexConfigMultiText("Summary Definition", "en", true) },
                    { LexConfig.EntryImportResidue, new LexConfigMultiText("Import Residue", "en", true) }
                }
            };

            var observerViewConfig = new LexRoleViewConfig
            {
                Fields =
                {
                    { LexConfig.Lexeme, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Definition, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Pos, new LexViewFieldConfig() },
                    { LexConfig.Semdom, new LexViewFieldConfig() },
                    { LexConfig.ExampleSentence, new LexViewMultiTextFieldConfig() },
                    { LexConfig.ExampleTranslation, new LexViewMultiTextFieldConfig() },

                    // Less common fields that are visible by default
                    { LexConfig.Gloss, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Pictures, new LexViewMultiTextFieldConfig() },
                    { LexConfig.CitationForm, new LexViewMultiTextFieldConfig() },
                    // { LexConfig.Environments, new LexViewFieldConfig() }, // Disabled 05-2016
                    { LexConfig.Pronunciation, new LexViewMultiTextFieldConfig() },
                    { LexConfig.CVPattern, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Tone, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Location, new LexViewFieldConfig() },
                    { LexConfig.Etymology, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EtymologyGloss, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EtymologyComment, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EtymologySource, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Note, new LexViewMultiTextFieldConfig() },
                    { LexConfig.LiteralMeaning, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EntryBibliography, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EntryRestrictions, new LexViewMultiTextFieldConfig() },
                    { LexConfig.SummaryDefinition, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EntryImportResidue, new LexViewMultiTextFieldConfig() },
                    { LexConfig.ScientificName, new LexViewMultiTextFieldConfig() },
                    { LexConfig.AnthropologyNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.SenseBibliography, new LexViewMultiTextFieldConfig() },
                    { LexConfig.DiscourseNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.EncyclopedicNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.GeneralNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.GrammarNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.PhonologyNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.SenseRestrictions, new LexViewMultiTextFieldConfig() },
                    { LexConfig.SemanticsNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.SociolinguisticsNote, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Source, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Usages, new LexViewFieldConfig() },
                    // { LexConfig.ReversalEntries, new LexViewFieldConfig() }, // Disabled 05-2016
                    { LexConfig.SenseType, new LexViewFieldConfig() },
                    { LexConfig.AcademicDomains, new LexViewFieldConfig() },
                    { LexConfig.AnthropologyCategories, new LexViewFieldConfig() },
                    { LexConfig.SenseImportResidue, new LexViewMultiTextFieldConfig() },
                    { LexConfig.Status, new LexViewFieldConfig() },
                    { LexConfig.Reference, new LexViewMultiTextFieldConfig() }
                },
                ShowTasks =
                {
                    { LexTask.View, true },
                    { LexTask.Dashboard, true },
                    { LexTask.GatherTexts, false },
                    { LexTask.Semdom, false },
                    { LexTask.Wordlist, false },
                    { LexTask.Dbe, true },
                    { LexTask.AddMeanings, false },
                    { LexTask.AddGrammar, false },
                    { LexTask.AddExamples, false },
                    { LexTask.Review, false }
                }
            };

            var observerWithCommentViewConfig = new LexRoleViewConfig(observerViewConfig);

            var contributorViewConfig = new LexRoleViewConfig(observerViewConfig);
            contributorViewConfig.ShowTasks[LexTask.AddMeanings] = true;
            contributorViewConfig.ShowTasks[LexTask.AddGrammar] = true;
            contributorViewConfig.ShowTasks[LexTask.AddExamples] = true;

            var managerViewConfig = new LexRoleViewConfig(contributorViewConfig);
            contributorViewConfig.ShowTasks[LexTask.GatherTexts] = true;
            contributorViewConfig.ShowTasks[LexTask.Semdom] = true;
            contributorViewConfig.ShowTasks[LexTask.Wordlist] = true;
            contributorViewConfig.ShowTasks[LexTask.Review] = true;

            RoleViews = new Dictionary<string, LexRoleViewConfig>
            {
                { LexRoles.Observer, observerViewConfig },
                { LexRoles.ObserverWithComment, observerWithCommentViewConfig },
                { LexRoles.Contributor, contributorViewConfig },
                { LexRoles.Manager, managerViewConfig }
            };
        }

        public Dictionary<string, LexTask> Tasks { get; protected set; }
        public LexConfigFieldList Entry { get; set; }
        public Dictionary<string, LexRoleViewConfig> RoleViews { get; protected set; }
        public Dictionary<string, LexUserViewConfig> UserViews { get; protected set; }
            = new Dictionary<string, LexUserViewConfig>();
    }
}
