using System.Collections.Generic;
using Newtonsoft.Json;

namespace Infusion.ServerSentEvents
{
    /// <summary>
    /// Represents Server-Sent Event.
    /// </summary>
    public class ServerSentEvent
    {
        #region Properties
        /// <summary>
        /// Gets or sets the event identifier (optional).
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the event type (optional).
        /// </summary>
        public string Type { get; set; }

        /// <summary>
        /// Gets or sets the event payload.
        /// </summary>
        public IList<string> Data { get; set; }
        #endregion

        /// <summary>
        /// Returns the event as a json string
        /// <summary>
        public override string ToString(){
            return JsonConvert.SerializeObject(this);
        }
    }
}