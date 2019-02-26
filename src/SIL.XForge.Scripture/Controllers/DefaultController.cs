using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SIL.XForge.Scripture.Controllers
{
    [AllowAnonymous]
    public class DefaultController : Controller
    {
        public IActionResult Index()
        {
            if (User.Identity.IsAuthenticated)
                return Redirect("/projects");
            return View();
        }
    }
}
