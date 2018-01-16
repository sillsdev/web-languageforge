namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexConfigPicturesDto : LexConfigMultiTextDto
    {
        public string CaptionLabel { get; set; }
        public bool CaptionHideIfEmpty { get; set; }
    }
}
