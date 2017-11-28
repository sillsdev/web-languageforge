using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{
    public class SystemRoles : RolesBase
    {
        public const string SystemAdmin = "system_admin";
        public const string User = "user";
        public const string None = "none";

        public static SystemRoles Instance { get; } = new SystemRoles();

        private SystemRoles()
        {
            Rights[User] = new HashSet<Right>
            {
                new Right(Domain.Users, Operation.EditOwn),
                new Right(Domain.Users, Operation.ViewOwn),
                new Right(Domain.Projects, Operation.ViewOwn)
            };

            var sysAdminRights = new HashSet<Right>();
            sysAdminRights.UnionWith(AllRights(Domain.Users));
            sysAdminRights.UnionWith(AllRights(Domain.Projects));
            Rights[SystemAdmin] = sysAdminRights;
        }

        public bool HasRight(User user, Right right)
        {
            return Rights[user.Role].Contains(right);
        }
    }
}
