using Infusion.ServerSentEvents;

namespace Microsoft.Extensions.DependencyInjection
{
    /// <summary>
    /// Provides extensions for registering middleware which provides support for Server-Sent Events protocol.
    /// </summary>
    public static partial class Extensions
    {
        /// <summary>
        /// Registers default service which provides operations over Server-Sent Events protocol.
        /// </summary>
        /// <param name="services">The collection of service descriptors.</param>
        /// <returns>The collection of service descriptors.</returns>
        public static IServiceCollection AddServerSentEvents(this IServiceCollection services)
        {
            services.AddServerSentEvents<IServerSentEventsService, ServerSentEventsService>();
            return services;
        }

        /// <summary>
        /// Registers custom service which provides operations over Server-Sent Events protocol.
        /// </summary>
        /// <typeparam name="TIServerSentEventsService">The type of service contract.</typeparam>
        /// <typeparam name="TServerSentEventsService">The type of service implementation.</typeparam>
        /// <param name="services">The collection of service descriptors.</param>
        /// <returns>The collection of service descriptors.</returns>
        public static IServiceCollection AddServerSentEvents<TIServerSentEventsService, TServerSentEventsService>(this IServiceCollection services)
            where TIServerSentEventsService : class, IServerSentEventsService
            where TServerSentEventsService : ServerSentEventsService, TIServerSentEventsService
        {
            services.AddSingleton<TServerSentEventsService>();
            services.AddSingleton<TIServerSentEventsService>(serviceProvider => serviceProvider.GetService<TServerSentEventsService>());

            return services;
        }
    }
}