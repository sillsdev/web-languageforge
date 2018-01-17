using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexProjectDto : ProjectDto
    {
        public IDictionary<string, InputSystemDto> InputSystems { get; set; }
        public LexConfigurationDto Config { get; set; }
    }
}
