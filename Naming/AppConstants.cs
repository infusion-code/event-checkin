namespace Infusion.CheckinAndGreeter
{
    internal class Constants
    {
            ///
            /// Eventbrite related constants
            ///
            public static string c_checkin = "barcode.checked_in";
            public static string c_checkout = "barcode.un_checked_in";  
            public static string c_attendeeRegEx = @".*events\/(.*)\/attendees\/(.*)\/";
            public static string c_checkinEventName = "checkin";
            public static string c_checkoutEventName = "checkout";

            ///
            /// Trace log message templates
            ///
            public static string m_receivedHookMessage = "Received {0} notification for attendee {1} and event {2}.";
            public static string m_sSEEventSent = "SSE event sent to attached clients";
            public static string m_initiatePayloadProcessing = "Initiate payload processing: {0}";
            public static int c_traceEventId = 3423;

            ///
            /// Post result constants
            ///
            public static string c_postStatusSuccess = "success";
            public static string c_postSuccessResult = "notification processed";
    }
}