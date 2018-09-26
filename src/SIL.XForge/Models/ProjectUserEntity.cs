namespace SIL.XForge.Models
{
    public class ProjectUserEntity : IEntity
    {
        public string Id { get; set; }
        public string Role { get; set; }
        public string UserRef { get; set; }
        public string ProjectRef { get; set; }
    }
}
