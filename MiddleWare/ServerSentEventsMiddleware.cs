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
        #region Fields
        private readonly RequestDelegate _next;
        private readonly ServerSentEventsService _serverSentEventsService;
        private readonly ILogger _logger;
        #endregion

        #region Constructor
        /// <summary>
        /// Initializes new instance of middleware.
        /// </summary>
        /// <param name="next">The next delegate in the pipeline.</param>
        /// <param name="serverSentEventsService">The service which provides operations over Server-Sent Events protocol.</param>
        public ServerSentEventsMiddleware(RequestDelegate next, ServerSentEventsService serverSentEventsService, ILogger<ServerSentEventsMiddleware> logger)
        {
            if (next == null)
            {
                throw new ArgumentNullException(nameof(next));
            }

            if (serverSentEventsService == null)
            {
                throw new ArgumentNullException(nameof(serverSentEventsService));
            }

            _next = next;
            _serverSentEventsService = serverSentEventsService;
        }
        #endregion

        #region Methods
        /// <summary>
        /// Process an individual request.
        /// </summary>
        /// <param name="context">The context.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public async Task Invoke(HttpContext context)
        {
            if (context.Request.Headers[Constants.ACCEPT_HTTP_HEADER] == Constants.SSE_CONTENT_TYPE)
            {
                _logger.LogDebug(1100, "New SSE Request from '{0}' on session '{1}'", context.Connection.RemoteIpAddress, context.Session.Id);
                context.Response.ContentType = Constants.SSE_CONTENT_TYPE;
                context.Response.Body.Flush();
                _logger.LogDebug(1100, "SSE sent content type to '{0}' on session '{1}'", context.Connection.RemoteIpAddress, context.Session.Id);

                ServerSentEventsClient client = new ServerSentEventsClient(context.Response);

                if (_serverSentEventsService.ReconnectInterval.HasValue)
                {
                    await client.ChangeReconnectIntervalAsync(_serverSentEventsService.ReconnectInterval.Value);
                }
                _logger.LogDebug(1100, "SSE setup new client for request from '{0}' on session '{1}'", context.Connection.RemoteIpAddress, context.Session.Id);

                string lastEventId = context.Request.Headers[Constants.LAST_EVENT_ID_HTTP_HEADER];
                if (!String.IsNullOrWhiteSpace(lastEventId))
                {
                    await _serverSentEventsService.OnReconnectAsync(client, lastEventId);
                }

                Guid clientId = _serverSentEventsService.AddClient(client);
                _logger.LogDebug(1100, "SSE added client with id {3} to service serving request from '{0}' on session '{1}'", context.Connection.RemoteIpAddress, context.Session.Id, clientId);

                await context.RequestAborted.WaitAsync();
                _logger.LogDebug(1100, "SSE Received abort request for client with id {3} to service serving request from '{0}' on session '{1}'", context.Connection.RemoteIpAddress, context.Session.Id, clientId);

                _serverSentEventsService.RemoveClient(clientId);
                _logger.LogDebug(1100, "SSE remove client with id {3} to service serving request from '{0}' on session '{1}'", context.Connection.RemoteIpAddress, context.Session.Id, clientId);
            }
            else
            {
                await _next(context);
            }
        }
        #endregion
    }
}