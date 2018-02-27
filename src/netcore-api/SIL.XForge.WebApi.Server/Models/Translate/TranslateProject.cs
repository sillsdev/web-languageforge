using System;

namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateProject : Project
    {
        public TranslateProject()
        {
            AppName = TranslateApp;
        }

        public override ProjectRoles Roles => TranslateRoles.Instance;
        public TranslateConfig Config { get; set; } = new TranslateConfig();
        public DateTime LastSyncedDate { get; set; } = DateTimeOffset.FromUnixTimeSeconds(0).UtcDateTime;
    }
}
