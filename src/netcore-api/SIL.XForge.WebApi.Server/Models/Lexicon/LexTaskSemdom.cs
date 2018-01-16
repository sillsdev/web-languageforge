using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexTaskSemdom : LexTask
    {
        public LexTaskSemdom()
        {
            Type = Semdom;

            VisibleFields["definition"] = true;
            VisibleFields["partOfSpeech"] = true;
            VisibleFields["example"] = true;
            VisibleFields["translation"] = true;
        }

        public string Language { get; set; } = "en";
        public Dictionary<string, bool> VisibleFields { get; protected set; } = new Dictionary<string, bool>();
    }
}
