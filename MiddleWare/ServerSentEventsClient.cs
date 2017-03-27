using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Infusion.ServerSentEvents
{
    /// <summary>
    /// Represents client listening for Server-Sent Events
    /// </summary>
    public sealed class ServerSentEventsClient : IServerSentEventsClient
    {

        /// field declarations
        private readonly HttpResponse _response;

        /// <summary>
        /// Creates a new instance of a ServerSentEventsClient for a given http response
        /// </summary>
        /// <param name="response">HttpResponse to use with the client</param>
        internal ServerSentEventsClient(HttpResponse response)
        {
            if (response == null) throw new ArgumentNullException(nameof(response));
            _response = response;
        }

        /// <summary>
        /// Sends event to client.
        /// </summary>
        /// <param name="text">The simple text event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(string text)
        {
            return _response.WriteSseEventAsync(text);
        }

        /// <summary>
        /// Sends event to client.
        /// </summary>
        /// <param name="serverSentEvent">The event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(ServerSentEvent serverSentEvent)
        {
            return _response.WriteSseEventAsync(serverSentEvent);
        }

        /// <summary>
        /// Changes the Reconnect Interval. Used by the browser if the connection dropped to time 
        /// reconnection attempt.
        /// </summary>
        /// <param name="reconnectInterval">Integer representing the reconnection interval in seconds</param>
        internal Task ChangeReconnectIntervalAsync(uint reconnectInterval)
        {
            return _response.WriteSseRetryAsync(reconnectInterval);
        }

    }
}