using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexConfigFieldListDto : LexConfigDto
    {
        public IReadOnlyList<string> FieldOrder { get; set; }
        public IDictionary<string, LexConfigDto> Fields { get; set; }
    }
}
