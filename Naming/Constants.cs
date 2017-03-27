namespace Infusion.ServerSentEvents
{
    internal static class Constants
    {
        ///
        /// SSE Constants
        ///
        public static string ACCEPT_HTTP_HEADER = "Accept";
        public static string LAST_EVENT_ID_HTTP_HEADER = "Last-Event-ID";
        public static string SSE_CONTENT_TYPE = "text/event-stream";
        public static string SSE_RETRY_FIELD = "retry";
        public static string SSE_ID_FIELD = "id";
        public static string SSE_EVENT_FIELD = "event";
        public static string SSE_DATA_FIELD = "data";
        public static string SSE_HEARTBEAT = "heartbeat";


        ///
        /// trace message templates
        ///
        public static string m_initiateSSESend = "SSE initiating send for all clients with data '{0}'";
        public static string m_initiateSSEReconnect = "SSE client reconnected.";
        public static string m_registerSSEClient = "SSE added client with id '{0}'. '{1}' clients are registered.";
        public static string m_removeSSEClient = "SSE removed client with id '{0}'. '{1}' clients are registered.";
        public static string m_startHearbeat = "SSE startup heartbeat with internal {0}ms.";
        public static string m_cancelHeartbeat = "SSE heartbeat cancellation requested.";
        public static string m_heartbeatCancelled = "SSE heartbeat cancelled.";
        public static string m_newConnectionRequest = "New SSE Request from '{0}'";
        public static string m_newSSEClientComplete = "SSE setup new client for request from '{0}'";
        public static string m_reconnectSSEClient = "SSE rconnected client for serving request from '{0}'";
        public static string m_abortSEEClient =  "SSE Received abort request for client with id '{0}' to service serving request from '{1}'";
        public static string m_addSSEClientToService = "SSE added client with id '{0}' to service serving request from '{1}'"; 
        public static string m_removeSSEClientFromService = "SSE remove client with id '{0} 'to service serving request from '{1}'";

        ///
        /// trace event ids
        /// 
        public static int c_eventServiceTraceId = 3400;
        public static int c_middlewareTraceId = 3401;
    }
}