using System;

namespace SIL.XForge.Configuration
{
    public class SiteOptions
    {
        public string Name { get; set; }
        public Uri Origin { get; set; }
        public string SmtpServer { get; set; }
        public string PortNumber { get; set; }
        public bool SendEmail { get; set; }
        public string SharedDir { get; set; }
    }
}
