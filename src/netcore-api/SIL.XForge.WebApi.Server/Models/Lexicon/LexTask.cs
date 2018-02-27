namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexTask
    {
        public const string View = "view";
        public const string Dashboard = "dashboard";
        public const string GatherTexts = "gatherTexts";
        public const string Semdom = "semdom";
        public const string Wordlist = "wordlist";
        public const string Dbe = "dbe";
        public const string AddMeanings = "addMeanings";
        public const string AddGrammar = "addGrammar";
        public const string AddExamples = "addExamples";
        public const string Review = "review";
        public const string ImportExport = "importExport";
        public const string Configuration = "configuration";

        public bool Visible { get; set; } = true;
        public string Type { get; set; } = "";
    }
}
