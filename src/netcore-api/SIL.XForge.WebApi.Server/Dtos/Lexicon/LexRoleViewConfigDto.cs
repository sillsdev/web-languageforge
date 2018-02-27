using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexRoleViewConfigDto
    {
        public IDictionary<string, LexViewFieldConfigDto> Fields { get; set; }
        public IDictionary<string, bool> ShowTasks { get; set; }
    }
}
