using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models
{
    public class SiteRoles : RolesBase
    {
        public const string SiteManager = "site_manager";
        public const string ProjectCreator = "project_creator";
        public const string User = "user";
        public const string None = "none";

        public static SiteRoles Instance { get; } = new SiteRoles();

        private SiteRoles()
        {
            var userRights = new HashSet<Right>
            {
                new Right(Domain.Users, Operation.EditOwn),
                new Right(Domain.Users, Operation.ViewOwn),
                new Right(Domain.Projects, Operation.ViewOwn)
            };
            Rights[User] = userRights;

            var projectCreatorRights = new HashSet<Right>(userRights)
            {
                new Right(Domain.Projects, Operation.Create)
            };
            Rights[ProjectCreator] = projectCreatorRights;

            var siteManagerRights = new HashSet<Right>(projectCreatorRights);
            siteManagerRights.UnionWith(AllRights(Domain.Projects));
            Rights[SiteManager] = siteManagerRights;
        }

        public bool HasRight(UserEntity user, string site, Right right)
        {
            if (user.SiteRole.TryGetValue(site, out string siteRole))
                return HasRight(siteRole, right);
            return false;
        }

        public bool HasRight(string siteRole, Right right)
        {
            if (siteRole == null)
                return false;
            return Rights[siteRole].Contains(right);
        }
    }
}
