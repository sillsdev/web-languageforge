using System;

namespace SIL.XForge.Models
{
    public class Site
    {
        public string CurrentProjectId { get; set; }
        public DateTime LastLogin { get; set; } = DateTimeOffset.FromUnixTimeSeconds(0).UtcDateTime;
    }
}
