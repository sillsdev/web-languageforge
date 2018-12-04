using System;

namespace SIL.XForge.Models
{
    public struct ResourceDescriptor
    {
        public ResourceDescriptor(Type resourceType, Type idType)
        {
            ResourceType = resourceType;
            IdType = idType;
        }

        public Type ResourceType { get; set; }
        public Type IdType { get; set; }

        public static ResourceDescriptor Empty => new ResourceDescriptor(null, null);
    }
}
