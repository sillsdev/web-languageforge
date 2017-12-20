namespace SIL.XForge.WebApi.Server.Models
{
    public class TranslateProject : Project
    {
        public override ProjectRoles Roles => TranslateRoles.Instance;
    }
}
