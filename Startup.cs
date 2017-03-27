using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using Infusion.ServerSentEvents;

namespace Infusion.CheckinAndGreeter
{
    /// <summary>
    /// This class implements the startup behavior for the app. 
    /// </summary>
    public class Startup
    {
        /// <summary> 
        /// Main entry for the app boot strapping.
        /// </summary>
        /// <param name="env">IHostingEnvironment implementation representing the host.</param>
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        /// <summary>
        /// Gets the configuration for the app.
        /// </summary>
        public IConfigurationRoot Configuration { get; }

        /// <summary>
        /// This method gets called by the runtime. Use this method to add services to the container.
        /// <summary>
        /// <paramref name="services">IServiceCollection implementation representing the service collection for the app.</param>
        public void ConfigureServices(IServiceCollection services)
        {
            // Add server sent events pocessing
            services.AddServerSentEvents<IServerSentEventsService, AttendeeCheckinServerSentEventsService>();

            // Add framework services.
            services.AddMvc();
        }

        /// <summary>
        /// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        /// </summary>
        /// <param name="app">IApplicationBuilder implementation representing the app</param>
        /// <param name="env">IHostingEnvironment implementation representing the host.</param>
        /// <param name="loggerFactory">ILoggerFactory implementation to configure logging</param>
        /// <param name="serviceProvider">IServiceProvider implementation providing the service factory</param>
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            if (env.IsDevelopment())
            {
                loggerFactory.AddDebug((category, logLevel) => (category.Contains("Infusion") && logLevel >= LogLevel.Trace));
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions {
                    HotModuleReplacement = true
                });
            }
            else
            {
                loggerFactory.AddDebug();
                app.UseExceptionHandler("/Home/Error");
            }

            app
                .MapServerSentEvents("/checkin-notifications", serviceProvider.GetService<AttendeeCheckinServerSentEventsService>())
                .UseStaticFiles()
                .UseMvc(routes =>
                {
                    routes.MapRoute(
                        name: "default",
                        template: "{controller=Home}/{action=Index}/{id?}");

                    routes.MapSpaFallbackRoute(
                        name: "spa-fallback",
                        defaults: new { controller = "Home", action = "Index" });
                });
        }
    }
}
