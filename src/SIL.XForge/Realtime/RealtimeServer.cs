using System.IO;
using System.Reflection;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.Extensions.Options;
using SIL.ObjectModel;
using SIL.XForge.Configuration;

namespace SIL.XForge.Realtime
{
    public class RealtimeServer : DisposableBase
    {
        private readonly INodeServices _nodeServices;
        private readonly IOptions<DataAccessOptions> _dataAccessOptions;
        private readonly IOptions<RealtimeOptions> _realtimeOptions;
        private readonly string _modulePath;
        private bool _started;

        public RealtimeServer(INodeServices nodeServices, IOptions<DataAccessOptions> dataAccessOptions,
            IOptions<RealtimeOptions> realtimeOptions)
        {
            _nodeServices = nodeServices;
            _dataAccessOptions = dataAccessOptions;
            _realtimeOptions = realtimeOptions;
            _modulePath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Realtime",
                "server");
        }

        public void Start()
        {
            if (_started)
                return;

            string mongo = $"{_dataAccessOptions.Value.ConnectionString}/{_dataAccessOptions.Value.MongoDatabaseName}";
            int port = _realtimeOptions.Value.Port;
            _nodeServices.InvokeExportAsync<object>(_modulePath, "start", mongo, port).GetAwaiter().GetResult();
            _started = true;
        }

        public void Stop()
        {
            if (!_started)
                return;

            _nodeServices.InvokeExportAsync<object>(_modulePath, "stop").GetAwaiter().GetResult();
            _started = false;
        }

        protected override void DisposeManagedResources()
        {
            Stop();
        }
    }
}
