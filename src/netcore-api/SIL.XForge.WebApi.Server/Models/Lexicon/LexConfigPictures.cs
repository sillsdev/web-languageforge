namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexConfigPictures : LexConfigMultiText
    {
        public LexConfigPictures()
        {
            Type = Pictures;
            Label = "Pictures";
        }

        public string CaptionLabel { get; set; } = "Captions";
        public bool CaptionHideIfEmpty { get; set; } = true;
    }
}
