using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexSenseDto
    {
        public IDictionary<string, LexValueDto> Definition { get; set; }
        public IDictionary<string, LexValueDto> Gloss { get; set; }
        public IReadOnlyList<LexPictureDto> Pictures { get; set; }
    }
}
