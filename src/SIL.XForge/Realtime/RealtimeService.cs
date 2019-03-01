using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using SIL.ObjectModel;
using SIL.XForge.Configuration;

namespace SIL.XForge.Realtime
{
    /**
     * This service is responsible for managing the real-time/ShareDB server. It provides methods for accessing
     * real-time data and performing actions on the server.
     */
    public class RealtimeService : DisposableBase, IRealtimeService
    {
        private readonly INodeServices _nodeServices;
        private readonly IOptions<DataAccessOptions> _dataAccessOptions;
        private readonly IOptions<RealtimeOptions> _realtimeOptions;
        private readonly IMongoDatabase _database;
        private readonly string _modulePath;
        private bool _started;

        public RealtimeService(INodeServices nodeServices, IOptions<DataAccessOptions> dataAccessOptions,
            IOptions<RealtimeOptions> realtimeOptions, IMongoClient mongoClient)
        {
            _nodeServices = nodeServices;
            _dataAccessOptions = dataAccessOptions;
            _realtimeOptions = realtimeOptions;
            _database = mongoClient.GetDatabase(_dataAccessOptions.Value.MongoDatabaseName);
            _modulePath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Realtime",
                "server");
        }

        public void StartServer()
        {
            if (_started)
                return;

            string mongo = $"{_dataAccessOptions.Value.ConnectionString}/{_dataAccessOptions.Value.MongoDatabaseName}";
            int port = _realtimeOptions.Value.Port;
            _nodeServices.InvokeExportAsync<object>(_modulePath, "start", mongo, port).GetAwaiter().GetResult();
            _started = true;
        }

        public void StopServer()
        {
            if (!_started)
                return;

            _nodeServices.InvokeExportAsync<object>(_modulePath, "stop").GetAwaiter().GetResult();
            _started = false;
        }

        public async Task DeleteAllAsync(string type, IEnumerable<string> ids)
        {
            IMongoCollection<BsonDocument> snapshotCollection = _database.GetCollection<BsonDocument>(type + "_data");
            FilterDefinition<BsonDocument> idFilter = Builders<BsonDocument>.Filter.In("_id", ids);
            await snapshotCollection.DeleteManyAsync(idFilter);

            IMongoCollection<BsonDocument> opsCollection = _database.GetCollection<BsonDocument>("o_" + type + "_data");
            FilterDefinition<BsonDocument> dFilter = Builders<BsonDocument>.Filter.In("d", ids);
            await opsCollection.DeleteManyAsync(dFilter);
        }

        protected override void DisposeManagedResources()
        {
            StopServer();
        }
    }
}
