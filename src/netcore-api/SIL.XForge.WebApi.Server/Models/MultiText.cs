using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{

    public class MultiText : Dictionary<string, MultiTextProperties>
    {
    }

    public class MultiTextProperties
    {
        public string value { get; set; }
    }
}