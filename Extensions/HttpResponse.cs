using System;
using System.Globalization;
using System.Threading.Tasks;
using Infusion.ServerSentEvents;

namespace Microsoft.AspNetCore.Http
{
    /// <summary>
    /// Extension methods to facilitate server sent events. 
    /// </summary>
    internal static partial class Extensions
    {
        /// <summary>
        /// Sends an event into the stream configuring the reconnedtion interval. 
        /// </summary>
        /// <param name="reconnectInterval">Integer containing the reconnect interval in seconds.</param>
        /// <param name="response">HttpRepsonse representing the response stream.</param>
        /// <returns>Task to be used to sync execution flow.</returns>
        internal static async Task WriteSseRetryAsync(this HttpResponse response, uint reconnectInterval)
        {
            await response.WriteSseEventFieldAsync(Constants.SSE_RETRY_FIELD, reconnectInterval.ToString(CultureInfo.InvariantCulture));
            await response.WriteSseEventBoundaryAsync();
            await response.Body.FlushAsync();
        }

        /// <summary>
        /// Sends an server sent data event into the stream
        /// </summary>
        /// <param name="text">String containing the event data to send.</param>
        /// <param name="response">HttpRepsonse representing the response stream.</param>
        /// <returns>Task to be used to sync execution flow.</returns>
        internal static async Task WriteSseEventAsync(this HttpResponse response, string text)
        {
            await response.WriteSseEventFieldAsync(Constants.SSE_DATA_FIELD, text);
            await response.WriteSseEventBoundaryAsync();
            await response.Body.FlushAsync();
        }

        /// <summary>
        /// Sends an server sent data event into the stream
        /// </summary>
        /// <param name="serverSentEvent">ServerSentEvent object representing the payload.</param>
        /// <param name="response">HttpRepsonse representing the response stream.</param>
        /// <returns>Task to be used to sync execution flow.</returns>
        internal static async Task WriteSseEventAsync(this HttpResponse response, ServerSentEvent serverSentEvent)
        {
            if (!String.IsNullOrWhiteSpace(serverSentEvent.Id)) await response.WriteSseEventFieldAsync(Constants.SSE_ID_FIELD, serverSentEvent.Id);
            if (!String.IsNullOrWhiteSpace(serverSentEvent.Type)) await response.WriteSseEventFieldAsync(Constants.SSE_EVENT_FIELD, serverSentEvent.Type);
            if (serverSentEvent.Data != null)
            {
                foreach(string data in serverSentEvent.Data)
                {
                    await response.WriteSseEventFieldAsync(Constants.SSE_DATA_FIELD, data);
                }
            }
            await response.WriteSseEventBoundaryAsync();
            await response.Body.FlushAsync();
        }

        /// <summary>
        /// Writes SSE field data into the stream
        /// </summary>
        /// <param name="response">HttpRepsonse representing the response stream.</param>
        /// <param name="field">String containing a valid SSE field name. See W3C SSE specifications for detail.</param>
        /// <param name="data">String containing the data for this field.</param>
        /// <returns>Task to be used to sync execution flow.</returns>
        private static Task WriteSseEventFieldAsync(this HttpResponse response, string field, string data)
        {
            return response.WriteAsync($"{field}: {data}\n");
        }

        /// <summary>
        /// Writes SSE event boundary into the stream
        /// </summary>
        /// <param name="response">HttpRepsonse representing the response stream.</param>
        /// <returns>Task to be used to sync execution flow.</returns>
        private static Task WriteSseEventBoundaryAsync(this HttpResponse response)
        {
            return response.WriteAsync("\n");
        }
    }
}
