using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace Infusion.CheckinAndGreeter
{
    /// <summary>'
    /// Implements the main class for the CheckinAnGreeter program. 
    /// </summary>
    public class Program
    {
        /// <summary>
        /// Entry point for the app
        /// </summary>
        /// <param name="args">String array containing arguments for the program</param>
        public static void Main(string[] args)
        {
            var config = new ConfigurationBuilder()
                .AddCommandLine(args)
                .AddEnvironmentVariables(prefix: "ASPNETCORE_")
                .Build();

            var host = new WebHostBuilder()
                .UseConfiguration(config)
                .UseKestrel()
                .UseAzureAppServices()
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseIISIntegration()
                .UseStartup<Startup>()
                .Build();

            host.Run();
        }
    }
}
