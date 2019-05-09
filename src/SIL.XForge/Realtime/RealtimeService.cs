using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.AspNetCore.NodeServices;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using ShareDB;
using SIL.ObjectModel;
using SIL.XForge.Configuration;
using SIL.XForge.Models;

namespace SIL.XForge.Realtime
{
    /// <summary>
    /// This service is responsible for managing the real-time/ShareDB server. It provides methods for accessing
    /// real-time data and performing actions on the server.
    /// </summary>
    public class RealtimeService : DisposableBase, IRealtimeService
    {
        private readonly INodeServices _nodeServices;
        private readonly IOptions<SiteOptions> _siteOptions;
        private readonly IOptions<DataAccessOptions> _dataAccessOptions;
        private readonly IOptions<RealtimeOptions> _realtimeOptions;
        private readonly IMongoDatabase _database;
        private readonly string _modulePath;
        private bool _started;

        public RealtimeService(INodeServices nodeServices, IOptions<SiteOptions> siteOptions,
            IOptions<DataAccessOptions> dataAccessOptions, IOptions<RealtimeOptions> realtimeOptions,
            IMongoClient mongoClient)
        {
            _nodeServices = nodeServices;
            _siteOptions = siteOptions;
            _dataAccessOptions = dataAccessOptions;
            _realtimeOptions = realtimeOptions;
            _database = mongoClient.GetDatabase(_dataAccessOptions.Value.MongoDatabaseName);
            _modulePath = Path.Combine(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), "Realtime",
                "realtime-server");
        }

        public void StartServer()
        {
            if (_started)
                return;

            object options = CreateOptions();
            _nodeServices.InvokeExportAsync<object>(_modulePath, "start", options).GetAwaiter().GetResult();
            _started = true;
        }

        public void StopServer()
        {
            if (!_started)
                return;

            _nodeServices.InvokeExportAsync<object>(_modulePath, "stop").GetAwaiter().GetResult();
            _started = false;
        }


        public async Task<IConnection> ConnectAsync()
        {
            var conn = new Connection(new Uri($"ws://localhost:{_realtimeOptions.Value.Port}"));
            try
            {
                await conn.StartAsync();
                return conn;
            }
            catch (Exception)
            {
                conn.Dispose();
                throw;
            }
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

        private object CreateOptions()
        {
            string mongo = $"{_dataAccessOptions.Value.ConnectionString}/{_dataAccessOptions.Value.MongoDatabaseName}";
            return new
            {
                connectionString = mongo,
                port = _realtimeOptions.Value.Port,
                origin = _siteOptions.Value.Origin.ToString(),
                projectsCollectionName = _realtimeOptions.Value.ProjectsCollectionName,
                projectRoles = CreateProjectRoles(_realtimeOptions.Value.ProjectRoles),
                collections = _realtimeOptions.Value.Collections.Select(c => CreateCollectionConfig(c)).ToArray()
            };
        }

        private static object CreateProjectRoles(ProjectRoles projectRoles)
        {
            return projectRoles.Rights.Select(kvp => new
            {
                name = kvp.Key,
                rights = kvp.Value.Select(r => r.Domain + (int)r.Operation).ToArray()
            }).ToArray();
        }

        private static object CreateCollectionConfig(RealtimeCollectionConfig collectionConfig)
        {
            return new
            {
                name = collectionConfig.Name,
                metadataName = collectionConfig.MetadataName,
                otTypeName = collectionConfig.OTTypeName,
                types = collectionConfig.Types
                    .OrderByDescending(t => t.Path.Count)
                    .Select(t => new { domain = t.Domain, path = t.Path.ToArray() })
                    .ToArray()
            };
        }
    }
}
