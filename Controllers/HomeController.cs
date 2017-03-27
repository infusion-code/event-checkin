using Microsoft.AspNetCore.Mvc;

namespace Infusion.CheckinAndGreeter.Controllers
{
    /// <summary>
    /// Implements the home controller for the app
    /// <summary>
    public class HomeController : Controller
    {
        /// <summary>
        /// Implements the Index action of the controller. This is usually the default action.    
        /// </summary>
        /// <returns>IActionResult object representing the view</returns>
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Implements the Error action of the controller.    
        /// </summary>
        /// <returns>IActionResult object representing the view</returns>
        public IActionResult Error()
        {
            return View();
        }
    }
}
