using SIL.Scripture;

namespace SIL.XForge.Scripture.Models
{
    public class VerseRefData
    {
        public int BookNum { get; set; }
        public int ChapterNum { get; set; }
        public int VerseNum { get; set; }
        public ScrVersType Versification { get; set; }
    }
}
