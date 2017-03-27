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
        /// <summary>Dictionary maintaing currently connected clients.</summary>
        private readonly ConcurrentDictionary<Guid, IServerSentEventsClient> _clients = new ConcurrentDictionary<Guid, IServerSentEventsClient>();
        
        /// <summary>Task representing the heartbeat event stream.</summary>
        private Task _heartbeat = null;

        /// <summary>CancellationToken source for the current heartbeat operation.</summary>
        private CancellationTokenSource _hearbeatCancellation = null;
        
        /// <summary>ILogger implementation for trace logging.</summary>
        private readonly ILogger _logger;
        #endregion

        #region Properties
        /// <summary>
        /// Gets the interval after which clients will attempt to reestablish failed connections.
        /// </summary>
        public uint? ReconnectInterval { get; private set; }

        /// <summary>
        /// Gets or sets whether to use a heartbeat event. A heartbeat appears necessary for use with IIS to ensure reliable event delivery. 
        /// If used with Kestrel only, set this to false.
        /// </summary>
        public bool UseHeartbeat { get; set; }

        /// <summary>
        /// Gets or sets the hearbeat interval in milliseconds. The default is 1000.
        public uint HeatbeatInterval {get; set;}
        #endregion

        /// <summary>
        /// Creates a new instance of the ServerSentEventsService
        /// </summary>
        /// <param name="logger">ILogger implementation used for trace logging</param>
        public ServerSentEventsService(ILogger<IServerSentEventsService> logger){
            this._logger = logger;
            this.HeatbeatInterval = 1000;
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
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_initiateSSESend, text);
            return ForAllClientsAsync(client => client.SendEventAsync(text));
        }

        /// <summary>
        /// Sends event to all clients.
        /// </summary>
        /// <param name="serverSentEvent">The event.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        public Task SendEventAsync(ServerSentEvent serverSentEvent)
        {
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_initiateSSESend, serverSentEvent);
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
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_initiateSSEReconnect);
            return System.Threading.TaskHelper.GetCompletedTask(); 
        }
 
        /// <summary>
        /// Adds a new IServerSentEventsClient to the list of connected clients
        /// </summary>
        /// <param name="client">IServerSentEventsClient implementation representing the client.</param>
        /// <returns>Guid that can be used to track the client.</returns>
        Guid IServerSentEventsService.AddClient(IServerSentEventsClient client)
        {
            Guid clientId = Guid.NewGuid();
            if(_clients.TryAdd(clientId, client))
            {
                if(_clients.Count > 0 && UseHeartbeat && (_heartbeat == null || _heartbeat.IsCanceled || _heartbeat.IsCompleted)) 
                {
                    this._hearbeatCancellation = new CancellationTokenSource();
                    this._hearbeatCancellation.Token.Register(this.OnHeartbeatCancellation);
                    this._heartbeat = Heartbeat(this._hearbeatCancellation.Token);
                }
            }
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_registerSSEClient, clientId, _clients.Count);
            return clientId;
        }

        /// <summary>
        /// Removes a IServerSentEventsClient from the list of connected clients
        /// </summary>
        /// <param name="clientId">Guid of the tracked client. This should be the guid received when calling AddClient().</param>
        void IServerSentEventsService.RemoveClient(Guid clientId)
        {
            IServerSentEventsClient client;
            if(_clients.TryRemove(clientId, out client))
            {
                if(_clients.Count == 0 && _heartbeat != null && _heartbeat.IsCanceled == false) _hearbeatCancellation.Cancel();
                if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_removeSSEClient, clientId, _clients.Count); 
            }
        }

        /// <summary>
        /// Delegate invoked on Heartbeat cancellation. Performs cleanup activities.
        /// </summary>
        protected virtual void OnHeartbeatCancellation(){
            this._heartbeat = null;
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_heartbeatCancelled);
        }

        /// <summary>
        /// Executes and operation on all connected clients
        /// </summary>
        /// <param name="clientOperationAsync">Func<ServerSentEventsClient, Task> delegate to invoke.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        private Task ForAllClientsAsync(Func<ServerSentEventsClient, Task> clientOperationAsync)
        {
            List<Task> clientsTasks = new List<Task>();
            foreach (ServerSentEventsClient client in _clients.Values)
            {
                clientsTasks.Add(clientOperationAsync(client));
            }
            return Task.WhenAll(clientsTasks);
        }

        /// <summary>
        /// Starts a repeating Heartbeat task. This appears necessary on IIS to facilitate timely delivery of messages.
        /// </summary>
        /// <param name="cts">CancellationToken to be used to cancel the heartbeat task.</param>
        /// <returns>The task object representing the asynchronous operation.</returns>
        private async Task Heartbeat(CancellationToken cts)
        {
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_startHearbeat, this.HeatbeatInterval);
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
                    Type = Constants.SSE_HEARTBEAT, 
                    Data = new List<string>(){
                        DateTime.Now.ToString()
                    }}));                
                await Task.Delay(250);
            }
            if(_logger != null && _logger.IsEnabled(LogLevel.Trace)) _logger.LogTrace(Constants.c_eventServiceTraceId, Constants.m_cancelHeartbeat);
        }
        #endregion
    }
}