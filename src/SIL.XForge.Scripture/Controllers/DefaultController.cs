using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;

namespace SIL.XForge.Scripture.Controllers
{
    [AllowAnonymous]
    public class DefaultController : Controller
    {
        private readonly IHostingEnvironment _environment;

        public DefaultController(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        public IActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
                return Redirect("/home");
            if (_environment.IsDevelopment())
            {
                // only show in development
                return View();
            }

            return NotFound();
        }
    }
}
