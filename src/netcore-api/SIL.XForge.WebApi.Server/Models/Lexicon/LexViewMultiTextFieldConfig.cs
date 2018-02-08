using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexViewMultiTextFieldConfig : LexViewFieldConfig
    {
        public LexViewMultiTextFieldConfig(LexViewMultiTextFieldConfig other)
            : base(other)
        {
            Type = "multitext";
            OverrideInputSystems = other.OverrideInputSystems;
            InputSystems = new List<string>(other.InputSystems);
        }

        public LexViewMultiTextFieldConfig(bool show = true)
            : base(show)
        {
            Type = "multitext";
            InputSystems = new List<string>();
        }

        public bool OverrideInputSystems { get; set; }
        public List<string> InputSystems { get; protected set; }

        public override LexViewFieldConfig Clone()
        {
            return new LexViewMultiTextFieldConfig(this);
        }
    }
}
