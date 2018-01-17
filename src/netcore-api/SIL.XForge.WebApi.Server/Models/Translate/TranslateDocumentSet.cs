namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateDocumentSet : EntityBase
    {
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public string BookId { get; set; }
    }
}
