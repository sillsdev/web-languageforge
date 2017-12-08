namespace SIL.XForge.WebApi.Server.Models
{
    public class LexProject : Project
    {
        public override ProjectRoles Roles => LexRoles.Instance;
    }
}
