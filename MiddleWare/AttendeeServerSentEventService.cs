using Infusion.ServerSentEvents;
using Microsoft.Extensions.Logging;

namespace Infusion.CheckinAndGreeter
{
    /// <summary>
    /// Service which provides operations over Server-Sent Events protocol for the attendee checkin events. This is mostly for 
    /// illustration on how to inject a custom service implementation, the service itself does not do much.!--.!--.!--.
    /// </summary>
    public class AttendeeCheckinServerSentEventsService : ServerSentEventsService, IServerSentEventsService
    {
        /// <summary>
        /// Creates a new instance of the AttendeeCheckinServerSentEventsService
        /// </summary>
        /// <param name="logger">ILogger instance to be used for logging.</param>
        public AttendeeCheckinServerSentEventsService(ILogger<IServerSentEventsService> logger) : base(logger)
        {
            this.ChangeReconnectIntervalAsync(1000);
        }
    }
}
