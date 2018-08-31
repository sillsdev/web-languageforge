using System.Collections.Generic;

namespace SIL.XForge.Models.SFChecks
{
    public class SFChecksRoles : ProjectRoles
    {
        public static SFChecksRoles Instance { get; } = new SFChecksRoles();

        private SFChecksRoles()
        {
            var contributorRights = new HashSet<Right>
            {
                new Right(Domain.Projects, Operation.View),
                new Right(Domain.Texts, Operation.View),
                new Right(Domain.Questions, Operation.View),
                new Right(Domain.Answers, Operation.View),
                new Right(Domain.Answers, Operation.ViewOwn),
                new Right(Domain.Answers, Operation.Create),
                new Right(Domain.Answers, Operation.EditOwn),
                new Right(Domain.Answers, Operation.DeleteOwn),
                new Right(Domain.Comments, Operation.View),
                new Right(Domain.Comments, Operation.ViewOwn),
                new Right(Domain.Comments, Operation.Create),
                new Right(Domain.Comments, Operation.EditOwn),
                new Right(Domain.Comments, Operation.DeleteOwn)
            };
            Rights[Contributor] = contributorRights;

            var managerRights = new HashSet<Right>(contributorRights)
            {
                new Right(Domain.Projects, Operation.Edit),
                new Right(Domain.Texts, Operation.Create),
                new Right(Domain.Texts, Operation.Edit),
                new Right(Domain.Texts, Operation.Archive),
                new Right(Domain.Questions, Operation.Create),
                new Right(Domain.Questions, Operation.Edit),
                new Right(Domain.Questions, Operation.Archive),
                new Right(Domain.Answers, Operation.Edit),
                new Right(Domain.Answers, Operation.Delete),
                new Right(Domain.Comments, Operation.Edit),
                new Right(Domain.Comments, Operation.Delete),
                new Right(Domain.Tags, Operation.Create),
                new Right(Domain.Tags, Operation.Edit),
                new Right(Domain.Tags, Operation.Delete),
                new Right(Domain.Users, Operation.Create),
                new Right(Domain.Users, Operation.Edit),
                new Right(Domain.Users, Operation.Delete),
                new Right(Domain.Users, Operation.View)
            };
            managerRights.UnionWith(AllRights(Domain.Templates));
            Rights[Manager] = managerRights;
        }
    }
}
