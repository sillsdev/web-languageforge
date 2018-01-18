namespace SIL.XForge.WebApi.Server.Dtos.Lexicon
{
    public class LexTaskDashboardDto : LexTaskDto
    {
        public int TimeSpanDays { get; set; }
        public int TargetWordCount { get; set; }
    }
}
