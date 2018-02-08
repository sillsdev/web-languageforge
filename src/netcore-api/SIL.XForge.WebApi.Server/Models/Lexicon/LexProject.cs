using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexProject : Project
    {
        public LexProject()
        {
            AppName = LexiconApp;
            InputSystems = new Dictionary<string, InputSystem>
            {
                { "en", new InputSystem("en", "English", "en") },
                { "th", new InputSystem("th", "Thai", "th") }
            };
        }

        public override ProjectRoles Roles => LexRoles.Instance;
        public Dictionary<string, InputSystem> InputSystems { get; protected set; }
        public LexConfiguration Config { get; set; } = new LexConfiguration();
    }
}
