using System.Collections.Generic;
using SIL.XForge.Models;

namespace SIL.XForge.Configuration
{
    public class RealtimeOptions
    {
        public int Port { get; set; }
        public string ProjectsCollectionName { get; set; }
        public ProjectRoles ProjectRoles { get; set; }
        public IList<RealtimeCollectionConfig> Collections { get; set; } = new List<RealtimeCollectionConfig>();
    }
}
