using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexConfigurationDto
    {
        public IDictionary<string, LexTaskDto> Tasks { get; set; }
        public LexConfigFieldListDto Entry { get; set; }
        public IDictionary<string, LexRoleViewConfigDto> RoleViews { get; set; }
    }
}
