using Infusion.ServerSentEvents;
using Microsoft.Extensions.Logging;

namespace Infusion.CheckinAndGreeter
{
    public class AttendeeCheckinServerSentEventsService : ServerSentEventsService, IAttendeeCheckinServerSentEventsService
    {
        public AttendeeCheckinServerSentEventsService(ILogger<IServerSentEventsService> logger) : base(logger)
        {
            //ChangeReconnectIntervalAsync(1000);
        }
    }
}
