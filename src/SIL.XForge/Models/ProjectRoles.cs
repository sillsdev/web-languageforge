using System;
using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class ProjectRoles
    {
        public const string Manager = "project_manager";
        public const string Contributor = "contributor";
        public const string None = "none";

        public ProjectRoles()
        {
            Rights = new Dictionary<string, ISet<Right>>();
        }

        protected IDictionary<string, ISet<Right>> Rights { get; }

        protected static IEnumerable<Right> AllRights(Domain domain)
        {
            foreach (Operation operation in Enum.GetValues(typeof(Operation)))
                yield return new Right(domain, operation);
        }

        public bool HasRight(ProjectEntity project, string userId, Right right)
        {
            if (project.Users.TryGetValue(userId, out ProjectRole user))
                return Rights[user.Role].Contains(right);
            return false;
        }
    }
}
