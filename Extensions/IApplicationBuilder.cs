using System;
using Microsoft.AspNetCore.Http;
using Infusion.ServerSentEvents;

namespace Microsoft.AspNetCore.Builder{

    /// <summary>
    /// IApplicationBuilder extension to inject Server Sent Event midlleware into .NET core pipeline. 
    /// </surmmary>
    public static partial class Extensions{

        /// <summary>
        /// Adds the middleware which provides support for Server-Sent Events protocol to the pipeline with default service.
        /// </summary>
        /// <param name="app">The pipeline builder.</param>
        /// <returns>The pipeline builder.</returns>
        public static IApplicationBuilder UseServerSentEvents(this IApplicationBuilder app)
        {
            if (app == null) throw new ArgumentNullException(nameof(app));
            return app.UseMiddleware<ServerSentEventsMiddleware>();
        }

        /// <summary>
        /// Adds the middleware which provides support for Server-Sent Events protocol to the pipeline with custom service.
        /// </summary>
        /// <param name="app">The pipeline builder.</param>
        /// <param name="serverSentEventsService">The custom service.</param>
        /// <returns>The pipeline builder.</returns>
        public static IApplicationBuilder UseServerSentEvents(this IApplicationBuilder app, ServerSentEventsService serverSentEventsService)
        {
            if (app == null) throw new ArgumentNullException(nameof(app));
            if (serverSentEventsService == null) throw new ArgumentNullException(nameof(serverSentEventsService));
            return app.UseMiddleware<ServerSentEventsMiddleware>(serverSentEventsService);
        }

        /// <summary>
        /// Adds the middleware which provides support for Server-Sent Events protocol to the branch of pipeline with default service.
        /// </summary>
        /// <param name="app">The pipeline builder.</param>
        /// <param name="pathMatch">The request path to match.</param>
        /// <returns>The pipeline builder.</returns>
        public static IApplicationBuilder MapServerSentEvents(this IApplicationBuilder app, PathString pathMatch)
        {
            if (app == null) throw new ArgumentNullException(nameof(app));
            return app.Map(pathMatch, branchedApp => branchedApp.UseMiddleware<ServerSentEventsMiddleware>());
        }

        /// <summary>
        /// Adds the middleware which provides support for Server-Sent Events protocol to the branch of pipeline with custom service.
        /// </summary>
        /// <param name="app">The pipeline builder.</param>
        /// <param name="pathMatch">The request path to match.</param>
        /// <param name="serverSentEventsService">The custom service.</param>
        /// <returns>The pipeline builder.</returns>
        public static IApplicationBuilder MapServerSentEvents(this IApplicationBuilder app, PathString pathMatch, ServerSentEventsService serverSentEventsService)
        {
            if (app == null)  throw new ArgumentNullException(nameof(app));
            if (serverSentEventsService == null) throw new ArgumentNullException(nameof(serverSentEventsService));
            return app.Map(pathMatch, branchedApp => branchedApp.UseMiddleware<ServerSentEventsMiddleware>(serverSentEventsService));
        }
    }
}