using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Infusion.CheckinAndGreeter.Controllers
{
    [Route("api/[controller]")]
    public class NotificationsController : Controller
    {
        private readonly ILogger _logger;

        public NotificationsController(ILogger<NotificationsController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public async Task<Object> Get()
        {
            using (_logger.BeginScope("Initiate Get"))
            {
                _logger.LogTrace(1000, "Entered Get Block");
            }
            return new { result = "success" }; 
        }

        [HttpPost]
        public IActionResult Notify()
        {
            using (_logger.BeginScope("Initiate Post"))
            {
                _logger.LogTrace(1001, "Post Received");
            }
            return CreatedAtRoute("", new { result =  "success" });
        }

    }
}
