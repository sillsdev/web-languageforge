using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Dtos
{
    public class ParatextUserInfoDto
    {
        public string Username { get; set; }
        public IReadOnlyList<ParatextProjectDto> Projects { get; set; }
    }
}
