using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class TextEntity : ProjectDataEntity
    {
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public string BookId { get; set; }
    }
}
