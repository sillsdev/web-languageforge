using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class TestProjectRoles : ProjectRoles
    {
        public const int TestDomain = 1000;

        public const string Manager = "manager";
        public const string Contributor = "contributor";

        public static TestProjectRoles Instance { get; } = new TestProjectRoles();

        private TestProjectRoles()
        {
            var contributorRights = new HashSet<Right>
            {
                new Right(TestDomain, Operation.ViewOwn),
                new Right(TestDomain, Operation.EditOwn),
                new Right(TestDomain, Operation.Create),
                new Right(TestDomain, Operation.DeleteOwn)
            };
            Rights[Contributor] = contributorRights;

            var managerRights = new HashSet<Right>(contributorRights)
            {
                new Right(TestDomain, Operation.View),
                new Right(TestDomain, Operation.Edit),
                new Right(TestDomain, Operation.Create),
                new Right(TestDomain, Operation.Delete)
            };
            Rights[Manager] = managerRights;
        }
    }
}
