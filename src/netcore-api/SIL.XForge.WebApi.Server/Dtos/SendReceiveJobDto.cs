namespace SIL.XForge.WebApi.Server.Dtos
{
    public class SendReceiveJobDto : ResourceDto
    {
        public ResourceDto Project { get; set; }
        public double PercentCompleted { get; set; }
        public string State { get; set; }
    }
}
