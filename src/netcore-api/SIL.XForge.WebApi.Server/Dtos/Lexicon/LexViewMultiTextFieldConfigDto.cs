using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexViewMultiTextFieldConfigDto : LexViewFieldConfigDto
    {
        public bool OverrideInputSystems { get; set; }
        public IReadOnlyList<string> InputSystems { get; set; }
    }
}
