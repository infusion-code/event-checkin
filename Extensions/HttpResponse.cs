using System;
using System.Globalization;
using System.Threading.Tasks;
using Infusion.ServerSentEvents;
using Microsoft.Extensions.Logging;

namespace Microsoft.AspNetCore.Http
{
    internal static partial class Extensions
    {

        internal static async Task WriteSseRetryAsync(this HttpResponse response, uint reconnectInterval, ILogger logger)
        {
            logger.LogDebug(1099, "SSE Start retry interval");
            await response.WriteSseEventFieldAsync(Constants.SSE_RETRY_FIELD, reconnectInterval.ToString(CultureInfo.InvariantCulture), logger);
            await response.WriteSseEventBoundaryAsync();
            await response.Body.FlushAsync();
            logger.LogDebug(1099, "SSE Complete retry interval");
        }

        internal static async Task WriteSseEventAsync(this HttpResponse response, string text, ILogger logger)
        {
            await response.WriteSseEventFieldAsync(Constants.SSE_DATA_FIELD, text, logger);
            await response.WriteSseEventBoundaryAsync();
            await response.Body.FlushAsync();
            logger.LogDebug(1099, "SSE Async write complete");
        }

        internal static async Task WriteSseEventAsync(this HttpResponse response, ServerSentEvent serverSentEvent, ILogger logger)
        {
            if (!String.IsNullOrWhiteSpace(serverSentEvent.Id))
            {
                await response.WriteSseEventFieldAsync(Constants.SSE_ID_FIELD, serverSentEvent.Id, logger);
                logger.LogDebug(1099, "SSE Start Async write complete");
            }

            if (!String.IsNullOrWhiteSpace(serverSentEvent.Type))
            {
                await response.WriteSseEventFieldAsync(Constants.SSE_EVENT_FIELD, serverSentEvent.Type, logger);
                logger.LogDebug(1099, "SSE Start Async write complete");
            }

            if (serverSentEvent.Data != null)
            {
                foreach(string data in serverSentEvent.Data)
                {
                    await response.WriteSseEventFieldAsync(Constants.SSE_DATA_FIELD, data, logger);
                    logger.LogDebug(1099, "SSE Start Async write complete");
                }
            }

            await response.WriteSseEventBoundaryAsync();
            await response.Body.FlushAsync();
            logger.LogDebug(1099, "SSE Async write complete");
        }

        private static Task WriteSseEventFieldAsync(this HttpResponse response, string field, string data, ILogger logger)
        {
            logger.LogDebug(1099, "SSE Start Async write with field '{0}', data '{1}'", field, data);
            return response.WriteAsync($"{field}: {data}\n");
        }

        private static Task WriteSseEventBoundaryAsync(this HttpResponse response)
        {
            return response.WriteAsync("\n");
        }
    }
}
