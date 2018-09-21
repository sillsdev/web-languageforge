namespace SIL.XForge.Models
{
    public class TestProjectRoles : ProjectRoles
    {
        public static TestProjectRoles Instance { get; } = new TestProjectRoles();

        private TestProjectRoles()
        {
        }
    }
}
