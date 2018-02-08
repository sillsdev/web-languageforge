using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexEntryDto : ResourceDto
    {
        public IDictionary<string, LexValueDto> Lexeme { get; set; }
        public IReadOnlyList<LexSenseDto> Senses { get; set; }
    }
}
