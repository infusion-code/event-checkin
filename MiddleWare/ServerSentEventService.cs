using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Infusion.ServerSentEvents
{
    /// <summary>
    /// Service which provides operations over Server-Sent Events protocol.
    /// </summary>
    public class ServerSentEventsService : IServerSentEventsService
    {
        #region Fields
        private readonly ConcurrentDictionary<Guid, ServerSentEventsClient> _clients = new ConcurrentDictionary<Guid, ServerSentEventsClient>();
        private Task _heartbeat = null;
        private CancellationTokenSource _hearbeatCancellation = null;
        private readonly ILogger _logger;
        #endregion

        #region Properties
        /// <summary>
        /// Gets the interval after which clients will attempt to reestablish failed connections.
        /// </summary>
        public uint? ReconnectInterval { get; private set; }

        public bool UseHeartbeat { get; set; }
        public uint HeatbeatInterval {get; set;}
        #endregion

        public ServerSentEventsService(ILogger<IServerSentEventsService> logger){
            this._logger = logger;
            this.HeatbeatInterval = 250;
            this.UseHeartbeat = true;
        }

        #region Methods
        /// <summary>
        /// Changes the interval after which clients will attempt to reestablish failed connections.
        /// </summary>
        /// <param name="reconnectInterval">The reconnect interval.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task ChangeReconnectIntervalAsync(uint reconnectInterval)
        {
            ReconnectInterval = reconnectInterval;
            return ForAllClientsAsync(client => client.ChangeReconnectIntervalAsync(reconnectInterval));
        }

        /// <summary>
        /// Sends event to all clients.
        /// </summary>
        /// <param name="text">The simple text event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(string text)
        {
            _logger.LogDebug(1100, "SSE initiating send for all clients with data '{0}'", text);
            return ForAllClientsAsync(client => client.SendEventAsync(text));
        }

        /// <summary>
        /// Sends event to all clients.
        /// </summary>
        /// <param name="serverSentEvent">The event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(ServerSentEvent serverSentEvent)
        {
            _logger.LogDebug(1100, "SSE initiating send for all clients with data '{0}'", serverSentEvent.ToString());
            return ForAllClientsAsync(client => client.SendEventAsync(serverSentEvent));
        }

        /// <summary>
        /// When overriden in delivered class allows for recovery when client has reestablished the connection.
        /// </summary>
        /// <param name="client">The client who has reestablished the connection.</param>
        /// <param name="lastEventId">The identifier of last event which client has received.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public virtual Task OnReconnectAsync(IServerSentEventsClient client, string lastEventId)
        {
            _logger.LogDebug(1100, "SSE client reconnect");
            return System.Threading.TaskHelper.GetCompletedTask();
        }
 
        internal Guid AddClient(ServerSentEventsClient client)
        {
            Guid clientId = Guid.NewGuid();
            if(_clients.TryAdd(clientId, client))
            {
                if(_clients.Count > 0 && UseHeartbeat && (_heartbeat == null || _heartbeat.IsCanceled || _heartbeat.IsCompleted)) 
                {
                    this._hearbeatCancellation = new CancellationTokenSource();
                    this._hearbeatCancellation.Token.Register(this.HeartbeatCancellation);
                    this._heartbeat = Heartbeat(this._hearbeatCancellation.Token);
                }
            }
            _logger.LogDebug(1100, "SSE added client with id '{0}'. '{1}' clients are registered.", clientId, _clients.Count);
            return clientId;
        }

        internal void RemoveClient(Guid clientId)
        {
            ServerSentEventsClient client;
            if(_clients.TryRemove(clientId, out client))
            {
                if(_clients.Count == 0 && _heartbeat != null && _heartbeat.IsCanceled == false) _hearbeatCancellation.Cancel(); 
            }
            if(client != null) _logger.LogDebug(1100, "SSE removed client with id '{0}'. '{1}' clients are registered.", clientId, _clients.Count);
        }

        private Task ForAllClientsAsync(Func<ServerSentEventsClient, Task> clientOperationAsync)
        {
            List<Task> clientsTasks = new List<Task>();
            foreach (ServerSentEventsClient client in _clients.Values)
            {
                clientsTasks.Add(clientOperationAsync(client));
            }
            return Task.WhenAll(clientsTasks);
        }

        private async Task Heartbeat(CancellationToken cts)
        {
            _logger.LogDebug(1100, "SSE startup heartbeat.");
            int id = 0;
            while (true)
            {
                // discontinue heartbeat if no clients are listening
                if(this._clients.Count == 0) break;
                if(cts.IsCancellationRequested) break;

                // send heartbeat SSE. This appears necessary for IIS in order to prevent the channel
                // from timing out. Kestrel does not seem to requrire this....
                await ForAllClientsAsync(client => client.SendEventAsync(new ServerSentEvent(){ 
                    Id = (id++).ToString(),
                    Type = "hearbeat", 
                    Data = new List<string>(){
                        DateTime.Now.ToString()
                    }}));                
                await Task.Delay(250);
            }
            _logger.LogDebug(1100, "SSE heartbeat cancellation requested.");
        }

        private void HeartbeatCancellation(){
            this._heartbeat = null;
            _logger.LogDebug(1100, "SSE heartbeat cancelled.");
        }
        #endregion
    }
}