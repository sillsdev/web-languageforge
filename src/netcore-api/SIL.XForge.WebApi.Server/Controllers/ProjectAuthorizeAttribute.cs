using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public class ProjectAuthorizeAttribute : TypeFilterAttribute
    {
        public ProjectAuthorizeAttribute(Domain domain, Operation operation, string argument = null)
            : base(typeof(ProjectAuthorizeFilter))
        {
            Arguments = new object[] { new Right(domain, operation), argument };
        }
    }
}
