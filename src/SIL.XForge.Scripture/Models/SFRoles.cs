using System.Collections.Generic;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFRoles : ProjectRoles
    {
        public static SFRoles Instance { get; } = new SFRoles();

        private SFRoles()
        {
            var contributorRights = new HashSet<Right>
            {
                new Right(Domain.Texts, Operation.View),
                new Right(Domain.Texts, Operation.Edit),
                new Right(Domain.Texts, Operation.Create),
                new Right(Domain.Texts, Operation.Delete),
                new Right(Domain.Questions, Operation.View),
                new Right(Domain.Answers, Operation.View),
                new Right(Domain.Answers, Operation.Create),
                new Right(Domain.Answers, Operation.EditOwn),
                new Right(Domain.Answers, Operation.DeleteOwn),
                new Right(Domain.Comments, Operation.View),
                new Right(Domain.Comments, Operation.Create),
                new Right(Domain.Comments, Operation.EditOwn),
                new Right(Domain.Comments, Operation.DeleteOwn),
                new Right(Domain.SendReceiveJobs, Operation.View),
                new Right(Domain.SendReceiveJobs, Operation.Create),
                new Right(Domain.SendReceiveJobs, Operation.Delete)
            };
            Rights[Contributor] = contributorRights;

            var managerRights = new HashSet<Right>(contributorRights)
            {
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
                new Right(Domain.Tags, Operation.Delete)
            };
            Rights[Manager] = managerRights;
        }
    }
}
