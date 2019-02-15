using SIL.Scripture;

namespace SIL.XForge.Scripture.Models
{
    public class VerseRefData
    {
        public string Book { get; set; }
        public string Chapter { get; set; }
        public string Verse { get; set; }
        public ScrVersType Versification { get; set; }
    }
}
