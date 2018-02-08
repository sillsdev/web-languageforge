using System;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexAuthorInfo
    {
        public string CreatedByUserRef { get; set; }
        public DateTime CreatedDate { get; set; }
        public string ModifiedByUserRef { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
