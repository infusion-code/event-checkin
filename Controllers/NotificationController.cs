using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace Infusion.CheckinAndGreeter.Controllers
{
    [Route("api/[controller]")]
    public class NotificationsController : Controller
    {


        [HttpGet]
        public async Task<Object> Get()
        {
            Console.WriteLine("Initiate Get");
            return new { result = "success" }; 
        }

        [HttpPost]
        public IActionResult Notify()
        {
            Console.WriteLine("Post Received");
            return CreatedAtRoute("", new { result =  "success" });
        }

    }
}
