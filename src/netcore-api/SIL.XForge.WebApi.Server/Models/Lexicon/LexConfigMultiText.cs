using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexConfigMultiText : LexConfig
    {
        public LexConfigMultiText(string label, string inputSystem, bool hideIfEmpty = false)
        {
            Type = MultiText;
            Label = label;
            HideIfEmpty = hideIfEmpty;
            InputSystems.Add(inputSystem);
        }

        public LexConfigMultiText()
        {
            Type = MultiText;
        }

        public int Width { get; set; } = 20;
        public List<string> InputSystems { get; protected set; } = new List<string>();
        public bool DisplayMultiline { get; set; }
    }
}
