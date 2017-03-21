using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

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
        public IActionResult Notify([FromBody]dynamic value)
        {
            using (_logger.BeginScope("Initiate Post"))
            {
                string resourceUrl = value.api_url.Value;
                //string attendeeId = 

                string payload = Newtonsoft.Json.JsonConvert.SerializeObject(value);
                _logger.LogTrace(1001, "Post Received: payload {0}", payload);
            }
            return StatusCode(200, new { result =  "success" });
        }

    }
}
