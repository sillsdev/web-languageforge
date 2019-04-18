namespace SIL.XForge.Models
{
    public class TestProjectUserEntity : ProjectUserEntity
    {
        public override string ProjectAdminLabel => TestProjectRoles.Administrator;
    }
}
