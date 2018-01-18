using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateRoles : ProjectRoles
    {
        public static TranslateRoles Instance { get; } = new TranslateRoles();

        private TranslateRoles()
        {
            var contributorRights = new HashSet<Right>
            {
                new Right(Domain.Projects, Operation.View),
                new Right(Domain.Entries, Operation.View),
                new Right(Domain.Entries, Operation.Edit),
                new Right(Domain.Entries, Operation.Create),
                new Right(Domain.Entries, Operation.Delete)
            };
            Rights[Contributor] = contributorRights;

            var managerRights = new HashSet<Right>(contributorRights)
            {
                new Right(Domain.Projects, Operation.Edit),
                new Right(Domain.Users, Operation.Create),
                new Right(Domain.Users, Operation.Edit),
                new Right(Domain.Users, Operation.Delete),
                new Right(Domain.Users, Operation.View)
            };
            managerRights.UnionWith(AllRights(Domain.Entries));
            Rights[Manager] = managerRights;
        }
    }
}
