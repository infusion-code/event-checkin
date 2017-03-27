using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infusion.ServerSentEvents
{
    /// <summary>
    /// Middleware which provides support for Server-Sent Events protocol.
    /// </summary>
    public class ServerSentEventsMiddleware
    {
        /// field declarations
        private readonly RequestDelegate _next;
        private readonly IServerSentEventsService _serverSentEventsService;
        private readonly ILogger _logger;

        /// <summary>
        /// Initializes new instance of middleware.
        /// </summary>
        /// <param name="next">The next delegate in the pipeline.</param>
        /// <param name="serverSentEventsService">The service which provides operations over Server-Sent Events protocol.</param>
        /// <param name="logger">ILogger implementation used for trace logging</param>
        public ServerSentEventsMiddleware(RequestDelegate next, IServerSentEventsService serverSentEventsService, ILogger<ServerSentEventsMiddleware> logger)
        {
            if (next == null) throw new ArgumentNullException(nameof(next));
            if (serverSentEventsService == null) throw new ArgumentNullException(nameof(serverSentEventsService));

            _next = next;
            _serverSentEventsService = serverSentEventsService;
            _logger = logger;

            // setup IServerSentEventsService heartbeat here based on local configuration properties
            _serverSentEventsService.UseHeartbeat = true;
            _serverSentEventsService.HeatbeatInterval = 1000;
        }

        /// <summary>
        /// Process an individual request.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public async Task Invoke(HttpContext context)
        {
            if(context == null) throw new ArgumentNullException("context");

            //
            // only process requests that have the appropriate Header
            //
            if (context.Request.Headers[Constants.ACCEPT_HTTP_HEADER] == Constants.SSE_CONTENT_TYPE)
            {
                if (_logger != null && _logger.IsEnabled(LogLevel.Trace))  _logger.LogTrace(Constants.c_middlewareTraceId, Constants.m_newConnectionRequest, context.Connection.RemoteIpAddress);

                // create new client to service the request
                context.Response.ContentType = Constants.SSE_CONTENT_TYPE;
                await context.Response.Body.FlushAsync();
                ServerSentEventsClient client = new ServerSentEventsClient(context.Response);
                if (_serverSentEventsService.ReconnectInterval.HasValue) await client.ChangeReconnectIntervalAsync(_serverSentEventsService.ReconnectInterval.Value);
                if (_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_middlewareTraceId, Constants.m_newSSEClientComplete, context.Connection.RemoteIpAddress);


                // check to see whether request is a reconnect request for a dropped connection
                string lastEventId = context.Request.Headers[Constants.LAST_EVENT_ID_HTTP_HEADER];
                if (!String.IsNullOrWhiteSpace(lastEventId))
                {
                    await _serverSentEventsService.OnReconnectAsync(client, lastEventId);
                    if (_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_middlewareTraceId, Constants.m_reconnectSSEClient, context.Connection.RemoteIpAddress);
                }

                // add client to the events service
                Guid clientId = _serverSentEventsService.AddClient(client);
                if (_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_middlewareTraceId, Constants.m_addSSEClientToService, clientId, context.Connection.RemoteIpAddress);

                // go into wait state until abort request is received. The _serverSentEventsService implementation is responsible for sending 
                // actual data into the channel. 
                await context.RequestAborted.WaitAsync();
                if (_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_middlewareTraceId, Constants.m_abortSEEClient, clientId, context.Connection.RemoteIpAddress);

                // remove client from service to prevent additional messages being sent to the channel.
                _serverSentEventsService.RemoveClient(clientId);
                if (_logger != null && _logger.IsEnabled(LogLevel.Trace))_logger.LogTrace(Constants.c_middlewareTraceId, Constants.m_removeSSEClientFromService, clientId, context.Connection.RemoteIpAddress);
            }
            else
            {
                await _next(context);
            }
        }
    }
}
