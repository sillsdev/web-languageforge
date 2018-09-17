// Copyright (c) 2018 SIL International
// This software is licensed under the MIT License (http://opensource.org/licenses/MIT)

using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using SIL.Extensions;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace SIL.XForge.ExceptionLogging
{
    public class BugsnagConfigurator: IConfigureOptions<Bugsnag.Configuration>
    {
        private readonly IConfiguration _bugsnagConfig;
        private readonly IHostingEnvironment _environment;

        public BugsnagConfigurator(IConfiguration bugsnagConfig,
            IHostingEnvironment                   environment)
        {
            _bugsnagConfig = bugsnagConfig;
            _environment = environment;
        }

        public void Configure(Bugsnag.Configuration configuration)
        {
            var topLevelDirectory = RunTerminalCommand("git", "rev-parse --show-toplevel");
            if (!topLevelDirectory.EndsWith(Path.DirectorySeparatorChar.ToString()))
                topLevelDirectory = topLevelDirectory + Path.DirectorySeparatorChar;

            configuration.ApiKey = _bugsnagConfig.GetValue<string>("ApiKey") ?? "missing-bugsnag-api-key";
            configuration.ProjectNamespaces = new[] { "SIL", "SIL.XForge.WebApi.Server", "ShareDB" };
            configuration.ProjectRoots = new[] { topLevelDirectory };
            configuration.AutoCaptureSessions = true;
            configuration.AutoNotify = true;
            configuration.AppType = ".NET";
            configuration.AppVersion = _bugsnagConfig.GetValue<string>("Version") ?? "0.0";
            // only send errors to bugsnag if we're running on live or qa
            configuration.NotifyReleaseStages = new[] { EnvironmentName.Staging, EnvironmentName.Production };

            if (string.IsNullOrEmpty(configuration.ReleaseStage))
            {
                configuration.ReleaseStage = _environment.EnvironmentName;
            }

            var metadata = new List<KeyValuePair<string, object>>();
            if (configuration.GlobalMetadata != null)
                metadata.AddRange(configuration.GlobalMetadata);

            var app = FindMetadata("App", metadata);
            var entryAssembly = Assembly.GetEntryAssembly();
            if (entryAssembly != null)
            {
                if (string.IsNullOrEmpty(configuration.AppVersion))
                    configuration.AppVersion = entryAssembly.GetName().Version.ToString();

                if (entryAssembly
                        .GetCustomAttributes(typeof(AssemblyInformationalVersionAttribute), true)
                        .FirstOrDefault() is AssemblyInformationalVersionAttribute
                    informationalVersion)
                {
                    app.Add("infoVersion", informationalVersion.InformationalVersion);
                }
            }

            if (configuration.GlobalMetadata == null)
                configuration.GlobalMetadata = metadata.ToArray();
            else
                configuration.GlobalMetadata.AddRange(metadata);
        }

        private static Dictionary<string, string> FindMetadata(string key,
            ICollection<KeyValuePair<string, object>> metadata)
        {
            foreach (var kv in metadata)
            {
                if (kv.Key == key)
                    return kv.Value as Dictionary<string, string>;
            }

            var dict = new Dictionary<string, string>();
            metadata.Add(new KeyValuePair<string, object>(key, dict));
            return dict;
        }

        /// <summary>
        /// Executes a command with arguments, used to send terminal commands in UNIX systems
        /// </summary>
        /// <param name="cmd">The command to send</param>
        /// <param name="args">The arguments to send</param>
        /// <returns>The returned output</returns>
        private static string RunTerminalCommand(string cmd, string args = null)
        {
            var proc = new Process {
                EnableRaisingEvents = false,
                StartInfo = {
                    FileName = cmd,
                    Arguments = args,
                    UseShellExecute = false,
                    RedirectStandardOutput = true
                }
            };
            proc.Start();
            proc.WaitForExit();
            var output = proc.StandardOutput.ReadToEnd();
            return output.Trim();
        }
    }
}
