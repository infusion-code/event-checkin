using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Infusion.ServerSentEvents;

namespace Infusion.CheckinAndGreeter.Controllers
{
    /// <summary>
    /// Notifications controller to provide web hook for event brite checkin notifications. 
    /// <summary>
    [Route("api/[controller]")]
    public class NotificationsController : Controller
    {
        /// field declarations
        private readonly ILogger _logger;
        private IServerSentEventsService _serverSentEventsService;

        /// <summary> 
        /// Creates a new instance of the NotificationsController
        /// </summary>
        /// <param name="logger">ILogger implementation to be used for trace logging</param>
        /// <param name="serverSentEventsService">IServerSentEventsService implementation use for SSE notifications to app</param>
        public NotificationsController(ILogger<NotificationsController> logger, IServerSentEventsService serverSentEventsService)
        {
            _logger = logger;
            _serverSentEventsService = serverSentEventsService;
        }

        /// <summary>
        /// Post endpoing for Eventbrite checkin web-hook.
        /// <summary>
        /// <param name="value">Json structure derived from the post body carrying the payload.</param>
        [HttpPost]
        public async Task<IActionResult> Notify([FromBody]dynamic value)
        {
            if(value == null) return BadRequest();
            if(value.config.action.Value != Constants.c_checkin && value.config.action.Value != Constants.c_checkout) return BadRequest();
            
            string payload = JsonConvert.SerializeObject(value);
            using (_logger.BeginScope(Constants.m_initiatePayloadProcessing, payload))
            {
                string resourceUrl = value.api_url.Value;
                string attendeeId = string.Empty;
                string eventId = string.Empty;
                bool isCheckin = value.config.action.Value == Constants.c_checkin;

                Regex r = new Regex(Constants.c_attendeeRegEx, RegexOptions.IgnoreCase );
                Match m = r.Match(resourceUrl);
                if(m.Success){
                    if(m.Groups.Count != 3) return BadRequest();
                    eventId = m.Groups[1].Value;
                    attendeeId = m.Groups[2].Value;
                }
                else return BadRequest();
                
                if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_traceEventId, Constants.m_receivedHookMessage, value.config.action.Value as string, attendeeId, eventId);
                dynamic d = new { attendee = attendeeId, evt = eventId, url = resourceUrl };
                await _serverSentEventsService.SendEventAsync(new ServerSentEvent(){
                    Id = attendeeId,
                    Type = isCheckin ? Constants.c_checkinEventName : Constants.c_checkoutEventName,
                    Data = new List<string>(){ JsonConvert.SerializeObject(d) }
                });
                if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_traceEventId, Constants.m_sSEEventSent);
            }
            return StatusCode(200, new { result =  Constants.c_postStatusSuccess, status = Constants.c_postSuccessResult });
        }

    }
}
