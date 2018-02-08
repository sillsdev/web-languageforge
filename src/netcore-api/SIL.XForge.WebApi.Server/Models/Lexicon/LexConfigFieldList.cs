using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexConfigFieldList : LexConfig
    {
        public LexConfigFieldList()
        {
            Type = FieldList;
        }

        public List<string> FieldOrder { get; protected set; } = new List<string>();
        public Dictionary<string, LexConfig> Fields { get; protected set; } = new Dictionary<string, LexConfig>();
    }
}
