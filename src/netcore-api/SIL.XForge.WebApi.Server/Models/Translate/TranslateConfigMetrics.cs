namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateConfigMetrics
    {
        public int ActiveEditTimeout { get; set; } = 5;
        public int EditingTimeout { get; set; } = 20 * 60;
    }
}
