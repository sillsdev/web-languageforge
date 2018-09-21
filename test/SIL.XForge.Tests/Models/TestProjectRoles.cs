using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class TestProjectRoles : ProjectRoles
    {
        public static TestProjectRoles Instance { get; } = new TestProjectRoles();

        private TestProjectRoles()
        {
            var contributorRights = new HashSet<Right>
            {
                new Right(Domain.Entries, Operation.ViewOwn),
                new Right(Domain.Entries, Operation.EditOwn),
                new Right(Domain.Entries, Operation.Create),
                new Right(Domain.Entries, Operation.DeleteOwn)
            };
            Rights[Contributor] = contributorRights;

            var managerRights = new HashSet<Right>(contributorRights)
            {
                new Right(Domain.Entries, Operation.View),
                new Right(Domain.Entries, Operation.Edit),
                new Right(Domain.Entries, Operation.Create),
                new Right(Domain.Entries, Operation.Delete)
            };
            Rights[Manager] = managerRights;
        }
    }
}
