using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infusion.ServerSentEvents
{
    /// <summary>
    /// Represents client listening for Server-Sent Events
    /// </summary>
    public sealed class ServerSentEventsClient : IServerSentEventsClient
    {
        #region Fields
        private readonly HttpResponse _response;
        private readonly ILogger _logger;
        #endregion

        #region Constructor
        internal ServerSentEventsClient(HttpResponse response, ILogger logger)
        {
            if (response == null)
            {
                throw new ArgumentNullException(nameof(response));
            }

            _response = response;
            _logger = logger;
        }
        #endregion

        #region Methods
        /// <summary>
        /// Sends event to client.
        /// </summary>
        /// <param name="text">The simple text event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(string text)
        {
            _logger.LogDebug(1101, "Send SSE data '{0}' to '{1}'", text, _response.HttpContext.Connection.RemoteIpAddress);
            return _response.WriteSseEventAsync(text, _logger);
        }

        /// <summary>
        /// Sends event to client.
        /// </summary>
        /// <param name="serverSentEvent">The event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(ServerSentEvent serverSentEvent)
        {
            _logger.LogDebug(1101, "Send SSE event '{0}' to '{1}'", serverSentEvent.ToString(), _response.HttpContext.Connection.RemoteIpAddress);
            return _response.WriteSseEventAsync(serverSentEvent, _logger);
        }

        internal Task ChangeReconnectIntervalAsync(uint reconnectInterval)
        {
            _logger.LogDebug(1101, "Send SSE reconnect interval '{0}' to '{1}'", reconnectInterval, _response.HttpContext.Connection.RemoteIpAddress);
            return _response.WriteSseRetryAsync(reconnectInterval, _logger);
        }
        #endregion
    }
}