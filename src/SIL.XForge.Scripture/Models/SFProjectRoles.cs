using System.Collections.Generic;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFProjectRoles : ProjectRoles
    {
        public const string Administrator = "pt_administrator";
        public const string Translator = "pt_translator";

        public static SFProjectRoles Instance { get; } = new SFProjectRoles();

        private SFProjectRoles()
        {
            var translatorRights = new HashSet<Right>
            {
                new Right(SFDomain.Texts, Operation.View),
                new Right(SFDomain.Texts, Operation.Edit),

                new Right(SFDomain.Questions, Operation.View),

                new Right(SFDomain.Answers, Operation.View),
                new Right(SFDomain.Answers, Operation.Create),
                new Right(SFDomain.Answers, Operation.EditOwn),
                new Right(SFDomain.Answers, Operation.DeleteOwn),

                new Right(SFDomain.Comments, Operation.View),
                new Right(SFDomain.Comments, Operation.Create),
                new Right(SFDomain.Comments, Operation.EditOwn),
                new Right(SFDomain.Comments, Operation.DeleteOwn),

                new Right(SFDomain.SyncJobs, Operation.View),
                new Right(SFDomain.SyncJobs, Operation.Create),
                new Right(SFDomain.SyncJobs, Operation.Delete)
            };
            Rights[Translator] = translatorRights;

            var administratorRights = new HashSet<Right>(translatorRights)
            {
                new Right(SFDomain.Questions, Operation.Create),
                new Right(SFDomain.Questions, Operation.Edit),
                new Right(SFDomain.Questions, Operation.Delete),

                new Right(SFDomain.Answers, Operation.Edit),
                new Right(SFDomain.Answers, Operation.Delete),

                new Right(SFDomain.Comments, Operation.Edit),
                new Right(SFDomain.Comments, Operation.Delete)
            };
            Rights[Administrator] = administratorRights;
        }
    }
}
