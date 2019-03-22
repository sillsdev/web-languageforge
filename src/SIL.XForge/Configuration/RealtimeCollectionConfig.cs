using System.Collections.Generic;

namespace SIL.XForge.Configuration
{
    public class RealtimeCollectionConfig
    {
        public RealtimeCollectionConfig(string name, string metadataName, string otTypeName)
        {
            Name = name;
            MetadataName = metadataName;
            OTTypeName = otTypeName;
        }

        public string Name { get; }
        public string MetadataName { get; }
        public string OTTypeName { get; }

        public IList<RealtimeType> Types { get; } = new List<RealtimeType>();
    }
}
