using System.Collections.Generic;
using System.Linq;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexRoleViewConfig
    {
        public LexRoleViewConfig(LexRoleViewConfig other)
        {
            Fields = other.Fields.ToDictionary(kvp => kvp.Key, kvp => kvp.Value.Clone());
            ShowTasks = new Dictionary<string, bool>(other.ShowTasks);
        }

        public LexRoleViewConfig()
        {
            Fields = new Dictionary<string, LexViewFieldConfig>();
            ShowTasks = new Dictionary<string, bool>();
        }

        public Dictionary<string, LexViewFieldConfig> Fields { get; protected set; }
        public Dictionary<string, bool> ShowTasks { get; protected set; }
    }
}
