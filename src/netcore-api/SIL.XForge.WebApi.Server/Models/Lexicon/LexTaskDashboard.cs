namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexTaskDashboard : LexTask
    {
        public LexTaskDashboard()
        {
            Type = Dashboard;
        }

        public int TimeSpanDays { get; set; }
        public int TargetWordCount { get; set; }
    }
}
