using Microsoft.AspNetCore.NodeServices;
using Microsoft.Extensions.Options;
using SIL.ObjectModel;
using SIL.XForge.Configuration;

namespace SIL.XForge.Scripture.Realtime
{
    public class RealtimeServer : DisposableBase
    {
        private readonly INodeServices _nodeServices;
        private readonly IOptions<DataAccessOptions> _dataAccessOptions;
        private bool _started;

        public RealtimeServer(INodeServices nodeServices, IOptions<DataAccessOptions> dataAccessOptions)
        {
            _nodeServices = nodeServices;
            _dataAccessOptions = dataAccessOptions;
        }

        public void Start()
        {
            if (_started)
                return;

            string mongo = $"{_dataAccessOptions.Value.ConnectionString}/{_dataAccessOptions.Value.MongoDatabaseName}";
            _nodeServices.InvokeExportAsync<object>("./Realtime/server", "start", mongo).GetAwaiter().GetResult();
            _started = true;
        }

        public void Stop()
        {
            if (!_started)
                return;

            _nodeServices.InvokeExportAsync<object>("./Realtime/server", "stop").GetAwaiter().GetResult();
            _started = false;
        }

        protected override void DisposeManagedResources()
        {
            Stop();
        }
    }
}
