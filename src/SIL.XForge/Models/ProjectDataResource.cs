namespace SIL.XForge.Models
{
    public abstract class ProjectDataResource : Resource
    {
        public string ProjectRef { get; set; }
        public string OwnerRef { get; set; }
    }
}
