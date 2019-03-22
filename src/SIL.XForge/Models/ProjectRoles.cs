using System;
using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public class ProjectRoles
    {
        public const string None = "none";

        public ProjectRoles()
        {
            Rights = new Dictionary<string, ISet<Right>>();
        }

        public IDictionary<string, ISet<Right>> Rights { get; }

        protected static IEnumerable<Right> AllRights(int domain)
        {
            foreach (Operation operation in Enum.GetValues(typeof(Operation)))
                yield return new Right(domain, operation);
        }
    }
}
