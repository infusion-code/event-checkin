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
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        //
        // This method gets called by the runtime. Use this method to add services to the container.
        //
        public void ConfigureServices(IServiceCollection services)
        {
            // Add server sent events pocessing
            //services.AddServerSentEvents<IAttendeeCheckinServerSentEventsService, AttendeeCheckinServerSentEventsService>();
            services.AddServerSentEvents();

            // Add framework services.
            services.AddMvc();
        }

        //
        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        //
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app
                //.MapServerSentEvents("/checkin-notifications", serviceProvider.GetService<AttendeeCheckinServerSentEventsService>())
                .MapServerSentEvents("/checkin-notifications")
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


            // Only for demo purposes, don't do this kind of thing to your production
            IServerSentEventsService serverSentEventsService = serviceProvider.GetService<IServerSentEventsService>();
            System.Threading.Thread eventsHeartbeatThread = new System.Threading.Thread(new System.Threading.ThreadStart(() =>
            {

                while (true)

                {

                    //serverSentEventsService.SendEventAsync($"Demo.AspNetCore.ServerSentEvents Heartbeat ({DateTime.UtcNow} UTC)").Wait();
                    dynamic d = new { attendee = "763377271", evt = "32967492658", url = "https://www.eventbriteapi.com/v3/events/32967492658/attendees/763377271/" };
                    serverSentEventsService.SendEventAsync(new ServerSentEvent(){
                        Id = "763377271",
                        Type = "checkin",
                        Data = new System.Collections.Generic.List<string>(){ Newtonsoft.Json.JsonConvert.SerializeObject(d) }
                    });

                    System.Threading.Thread.Sleep(30000);

                }

            }));
            eventsHeartbeatThread.Start();

        }
    }
}
