using System;
using System.Collections.Generic;

namespace SIL.XForge.Models
{
    public abstract class RolesBase
    {
        protected RolesBase()
        {
            Rights = new Dictionary<string, ISet<Right>>();
        }

        protected IDictionary<string, ISet<Right>> Rights { get; }

        protected static IEnumerable<Right> AllRights(Domain domain)
        {
            foreach (Operation operation in Enum.GetValues(typeof(Operation)))
                yield return new Right(domain, operation);
        }
    }
}
