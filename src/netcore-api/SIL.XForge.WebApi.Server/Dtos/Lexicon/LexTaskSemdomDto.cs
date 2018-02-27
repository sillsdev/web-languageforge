using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexTaskSemdomDto : LexTaskDto
    {
        public string Language { get; set; }
        public IDictionary<string, bool> VisibleFields { get; set; }
    }
}
