namespace SIL.XForge.WebApi.Server.Models
{
    public class SendReceiveJob : IEntity
    {
        public string Id { get; set; }
        public string Project { get; set; }
        public string BackgroundJobId { get; set; }
    }
}
