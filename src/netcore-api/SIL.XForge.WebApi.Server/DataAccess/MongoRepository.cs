using MongoDB.Bson;
using MongoDB.Driver;
using SIL.XForge.WebApi.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public class MongoRepository<T> : IRepository<T> where T : IEntity
    {
        private readonly IMongoClient _client;
        private readonly string _collectionName;

        public MongoRepository(IMongoClient client, string collectionName)
        {
            _client = client;
            _collectionName = collectionName;
        }

        public async Task<IReadOnlyList<T>> GetAllAsync(string dbName)
        {
            return await GetCollection(dbName).Find(Builders<T>.Filter.Empty).ToListAsync();
        }

        public Task<T> GetAsync(string dbName, string id)
        {
            return GetCollection(dbName).Find(CreateIdFilter(id)).FirstOrDefaultAsync();
        }

        public Task InsertAsync(string dbName, T entity)
        {
            return GetCollection(dbName).InsertOneAsync(entity);
        }

        public async Task<bool> UpdateAsync(string dbName, T entity)
        {
            ReplaceOneResult result = await GetCollection(dbName).ReplaceOneAsync(CreateIdFilter(entity.Id), entity);
            if (result.IsAcknowledged)
                return result.MatchedCount > 0;
            return false;
        }

        public async Task<bool> DeleteAsync(string dbName, T entity)
        {
            DeleteResult result = await GetCollection(dbName).DeleteOneAsync(CreateIdFilter(entity.Id));
            if (result.IsAcknowledged)
                return result.DeletedCount > 0;
            return false;
        }

        public async Task<bool> DeleteAsync(string dbName, string id)
        {
            DeleteResult result = await GetCollection(dbName).DeleteOneAsync(CreateIdFilter(id));
            if (result.IsAcknowledged)
                return result.DeletedCount > 0;
            return false;
        }

        protected static FilterDefinition<T> CreateIdFilter(string id)
        {
            return Builders<T>.Filter.Eq("_id", ObjectId.Parse(id));
        }

        protected IMongoCollection<T> GetCollection(string dbName)
        {
            return _client.GetDatabase(dbName).GetCollection<T>(_collectionName);
        }
    }
}
