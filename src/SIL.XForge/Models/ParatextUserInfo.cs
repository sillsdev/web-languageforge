using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class ParatextUserInfo
    {
        public string Username { get; set; }
        public IReadOnlyList<ParatextProject> Projects { get; set; }
    }
}
