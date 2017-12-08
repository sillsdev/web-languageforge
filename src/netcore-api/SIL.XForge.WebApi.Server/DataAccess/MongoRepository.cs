using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq.Expressions;

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
            return GetCollection(dbName).Find(e => e.Id == id).FirstOrDefaultAsync();
        }

        public IMongoQueryable<T> Query(string dbName)
        {
            return GetCollection(dbName).AsQueryable();
        }

        public async Task<bool> InsertAsync(string dbName, T entity)
        {
            try
            {
                await GetCollection(dbName).InsertOneAsync(entity);
                return true;
            }
            catch (AggregateException ae)
            {
                ae.Handle(e =>
                    {
                        var mwe = e as MongoWriteException;
                        if (mwe != null && mwe.WriteError.Category == ServerErrorCategory.DuplicateKey)
                            return true;
                        return false;
                    });
                return false;
            }
        }

        public async Task<bool> UpdateAsync(string dbName, T entity, bool upsert = false)
        {
            ReplaceOneResult result = await GetCollection(dbName).ReplaceOneAsync(e => e.Id == entity.Id, entity,
                new UpdateOptions { IsUpsert = upsert });
            if (result.IsAcknowledged)
                return upsert || result.MatchedCount > 0;
            return false;
        }

        public async Task<T> UpdateAsync(string dbName, Expression<Func<T, bool>> filter,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false)
        {
            return await GetCollection(dbName).FindOneAndUpdateAsync(filter, update(Builders<T>.Update),
                new FindOneAndUpdateOptions<T>
                {
                    IsUpsert = upsert,
                    ReturnDocument = ReturnDocument.After
                });
        }

        public async Task<bool> DeleteAsync(string dbName, T entity)
        {
            DeleteResult result = await GetCollection(dbName).DeleteOneAsync(e => e.Id == entity.Id);
            if (result.IsAcknowledged)
                return result.DeletedCount > 0;
            return false;
        }

        public Task<T> DeleteAsync(string dbName, Expression<Func<T, bool>> filter)
        {
            return GetCollection(dbName).FindOneAndDeleteAsync(filter);
        }

        protected IMongoCollection<T> GetCollection(string dbName)
        {
            return _client.GetDatabase(dbName).GetCollection<T>(_collectionName);
        }
    }
}
