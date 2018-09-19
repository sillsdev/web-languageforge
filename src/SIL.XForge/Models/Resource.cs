using System;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Models
{
    public class Resource : Identifiable<string>
    {
        [Attr("date-modified", true)]
        public DateTime DateModified { get; set; }
        [Attr("date-created", true)]
        public DateTime DateCreated { get; set; }
    }
}
