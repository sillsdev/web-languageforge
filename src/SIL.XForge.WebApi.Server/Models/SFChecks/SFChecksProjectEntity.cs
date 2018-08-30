namespace SIL.XForge.WebApi.Server.Models.SFChecks
{
    public class SFChecksProjectEntity : ProjectEntity
    {
        public SFChecksProjectEntity()
        {
            AppName = SFChecksApp;
        }

        public override ProjectRoles Roles => SFChecksRoles.Instance;

        public bool UsersSeeEachOthersResponses { get; set; } = true;
    }
}
