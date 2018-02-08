using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexConfigMultiTextDto : LexConfigDto
    {
        public int Width { get; set; }
        public IReadOnlyList<string> InputSystems { get; set; }
        public bool DisplayMultiline { get; set; }
    }
}
