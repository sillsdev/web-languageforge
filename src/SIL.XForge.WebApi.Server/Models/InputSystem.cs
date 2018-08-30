namespace SIL.XForge.WebApi.Server.Models
{
    public class InputSystem
    {
        public InputSystem(string tag = "qaa", string name = "", string abbr = "")
        {
            Tag = tag;
            Abbreviation = abbr;
            LanguageName = name;
        }

        public string Abbreviation { get; set; }
        public string Tag { get; set; }
        public string LanguageName { get; set; }
        public bool IsRightToLeft { get; set; }
    }
}
