using System;
using System.Threading.Tasks;

namespace Infusion.ServerSentEvents
{
    /// <summary>
    /// Contract for service which provides operations over Server-Sent Events protocol.
    /// </summary>
    public interface IServerSentEventsService
    {
        #region Properties
        /// <summary>
        /// Gets the interval after which clients will attempt to reestablish failed connections.
        /// </summary>
        uint? ReconnectInterval { get; }

        /// <summary>
        /// Gets or sets whether to use a heartbeat event. A heartbeat appears necessary for use with IIS to ensure reliable event delivery. 
        /// If used with Kestrel only, set this to false.
        /// </summary>
        bool UseHeartbeat { get; set; }

        /// <summary>
        /// Gets or sets the hearbeat interval in milliseconds. The default is 1000.
        uint HeatbeatInterval { get; set;}
        #endregion

        #region Methods
        /// <summary>
        /// Changes the interval after which clients will attempt to reestablish failed connections.
        /// </summary>
        /// <param name="reconnectInterval">The reconnect interval.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        Task ChangeReconnectIntervalAsync(uint reconnectInterval);

        /// <summary>
        /// Sends event to all clients.
        /// </summary>
        /// <param name="text">The simple text event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        Task SendEventAsync(string text);

        /// <summary>
        /// Sends event to all clients.
        /// </summary>
        /// <param name="serverSentEvent">The event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        Task SendEventAsync(ServerSentEvent serverSentEvent);

        /// <summary>
        /// When overriden in delivered class allows for recovery when client has reestablished the connection.
        /// </summary>
        /// <param name="client">The client who has reestablished the connection.</param>
        /// <param name="lastEventId">The identifier of last event which client has received.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        Task OnReconnectAsync(IServerSentEventsClient client, string lastEventId);

        /// <summary>
        /// Adds a new IServerSentEventsClient to the list of connected clients
        /// </summary>
        /// <param name="client">IServerSentEventsClient implementation representing the client.</param>
        /// <returns>Guid that can be used to track the client.</returns>
        Guid AddClient(IServerSentEventsClient client);

        /// <summary>
        /// Removes a IServerSentEventsClient from the list of connected clients
        /// </summary>
        /// <param name="clientId">Guid of the tracked client. This should be the guid received when calling AddClient().</param>
        void RemoveClient(Guid clientId);

        #endregion
    }
}