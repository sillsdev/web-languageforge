using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{
    public class LexRoles : ProjectRoles
    {
        public const string Observer = "observer";
        public const string ObserverWithComment = "observer_with_comment";

        public static LexRoles Instance { get; } = new LexRoles();

        private LexRoles()
        {
            var observerRights = new HashSet<Right>
            {
                new Right(Domain.Projects, Operation.View),
                new Right(Domain.Entries, Operation.View),
                new Right(Domain.Comments, Operation.View)
            };
            Rights[Observer] = observerRights;

            var observerWithCommentRights = new HashSet<Right>(observerRights)
            {
                new Right(Domain.Comments, Operation.Create),
                new Right(Domain.Comments, Operation.DeleteOwn),
                new Right(Domain.Comments, Operation.EditOwn)
            };
            Rights[ObserverWithComment] = observerWithCommentRights;

            var contributorRights = new HashSet<Right>(observerWithCommentRights)
            {
                new Right(Domain.Entries, Operation.Edit),
                new Right(Domain.Entries, Operation.Create),
                new Right(Domain.Entries, Operation.Delete)
            };
            Rights[Contributor] = contributorRights;

            var managerRights = new HashSet<Right>(contributorRights)
            {
                new Right(Domain.Comments, Operation.Edit),
                new Right(Domain.Comments, Operation.Delete),
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
