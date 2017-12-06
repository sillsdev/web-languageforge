using Microsoft.AspNetCore.Mvc;
using SIL.XForge.WebApi.Server.Models;

namespace SIL.XForge.WebApi.Server.Controllers
{
    public class SiteAuthorizeAttribute : TypeFilterAttribute
    {
        public SiteAuthorizeAttribute(Domain domain, Operation operation)
            : base(typeof(SiteAuthorizeFilter))
        {
            Arguments = new object[] { new Right(domain, operation) };
        }
    }
}
