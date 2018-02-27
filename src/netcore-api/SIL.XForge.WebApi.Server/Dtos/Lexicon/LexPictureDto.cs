using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexPictureDto
    {
        public string FileName { get; set; }
        public IDictionary<string, LexValueDto> Caption { get; set; }
    }
}
