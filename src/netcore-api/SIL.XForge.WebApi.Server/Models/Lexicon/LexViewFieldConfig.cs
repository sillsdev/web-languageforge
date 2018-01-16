namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexViewFieldConfig
    {
        public LexViewFieldConfig(LexViewFieldConfig other)
        {
            Show = other.Show;
            Type = other.Type;
        }

        public LexViewFieldConfig(bool show = true)
        {
            Show = show;
            Type = "basic";
        }

        public bool Show { get; set; }
        public string Type { get; protected set; }

        public virtual LexViewFieldConfig Clone()
        {
            return new LexViewFieldConfig(this);
        }
    }
}
