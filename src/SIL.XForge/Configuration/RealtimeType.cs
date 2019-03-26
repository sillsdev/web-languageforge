using System.Collections.Generic;

namespace SIL.XForge.Configuration
{
    public class RealtimeType
    {
        public RealtimeType(int domain)
        {
            Domain = domain;
        }

        public int Domain { get; }

        public IList<string> Path { get; set; } = new List<string>();
    }
}
