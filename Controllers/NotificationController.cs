using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Infusion.ServerSentEvents;


namespace Infusion.CheckinAndGreeter.Controllers
{
    [Route("api/[controller]")]
    public class NotificationsController : Controller
    {
        private readonly ILogger _logger;
        private IAttendeeCheckinServerSentEventsService _serverSentEventsService;

        public NotificationsController(ILogger<NotificationsController> logger, IAttendeeCheckinServerSentEventsService serverSentEventsService)
        {
            _logger = logger;
            _serverSentEventsService = serverSentEventsService;
        }

        [HttpPost]
        public async Task<IActionResult> Notify([FromBody]dynamic value)
        {
            if(value == null) return BadRequest();
            if(value.config.action.Value != "barcode.checked_in" && value.config.action.Value != "barcode.un_checked_in") return BadRequest();
            string payload = JsonConvert.SerializeObject(value);
            using (_logger.BeginScope("Initiate payload processing: {0}", payload))
            {
                string resourceUrl = value.api_url.Value;
                string attendeeId = string.Empty;
                string eventId = string.Empty;
                bool isCheckin = value.config.action.Value == "barcode.checked_in" ;

                Regex r = new Regex(@".*events\/(.*)\/attendees\/(.*)\/", RegexOptions.IgnoreCase );
                Match m = r.Match(resourceUrl);
                if(m.Success){
                    if(m.Groups.Count != 3) return BadRequest();
                    eventId = m.Groups[1].Value;
                    attendeeId = m.Groups[2].Value;
                }
                else return BadRequest();
                _logger.LogDebug(1001, "Post Received: payload {0}", payload);
                _logger.LogInformation(1001, "Received check-{0} notification for attendee {1} and event {2}", isCheckin ? "in" : "out", attendeeId, eventId);

                dynamic d = new { attendee = attendeeId, evt = eventId, url = resourceUrl };
                await _serverSentEventsService.SendEventAsync(new ServerSentEvent(){
                    Id = attendeeId,
                    Type = isCheckin ? "checkin" : "checkout",
                    Data = new List<string>(){ JsonConvert.SerializeObject(d) }
                });
            }

            var x = StatusCode(200, new { result =  "success", status = "notification pushed" });
            return x;
        }

    }
}
