using Infusion.ServerSentEvents;

namespace Infusion.CheckinAndGreeter
{
    public class AttendeeCheckinServerSentEventsService : ServerSentEventsService, IAttendeeCheckinServerSentEventsService
    {
        public AttendeeCheckinServerSentEventsService()
        {
            //ChangeReconnectIntervalAsync(1000);
        }
    }
}
