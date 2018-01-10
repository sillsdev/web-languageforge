namespace SIL.XForge.WebApi.Server.Models
{
    public class TranslateDocumentSet : IEntity
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public string BookId { get; set; }
    }
}
