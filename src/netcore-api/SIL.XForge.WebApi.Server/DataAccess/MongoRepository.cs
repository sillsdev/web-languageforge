using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq.Expressions;
using SIL.XForge.WebApi.Server.Utils;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public class MongoRepository<T> : IRepository<T> where T : IEntity
    {
        private readonly IMongoCollection<T> _collection;

        public MongoRepository(IMongoCollection<T> collection)
        {
            _collection = collection;
        }

        public async Task<IReadOnlyList<T>> GetAllAsync()
        {
            return await _collection.Find(Builders<T>.Filter.Empty).ToListAsync();
        }

        public async Task<Attempt<T>> TryGetAsync(string id)
        {
            T entity = await _collection.Find(e => e.Id == id).FirstOrDefaultAsync();
            return new Attempt<T>(entity != null, entity);
        }

        public IMongoQueryable<T> Query()
        {
            return _collection.AsQueryable();
        }

        public async Task<bool> InsertAsync(T entity)
        {
            try
            {
                await _collection.InsertOneAsync(entity);
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

        public async Task<bool> UpdateAsync(T entity, bool upsert = false)
        {
            ReplaceOneResult result = await _collection.ReplaceOneAsync(e => e.Id == entity.Id, entity,
                new UpdateOptions { IsUpsert = upsert });
            if (result.IsAcknowledged)
                return upsert || result.MatchedCount > 0;
            return false;
        }

        public async Task<T> UpdateAsync(Expression<Func<T, bool>> filter,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false)
        {
            return await _collection.FindOneAndUpdateAsync(filter, update(Builders<T>.Update),
                new FindOneAndUpdateOptions<T>
                {
                    IsUpsert = upsert,
                    ReturnDocument = ReturnDocument.After
                });
        }

        public Task<T> DeleteAsync(Expression<Func<T, bool>> filter)
        {
            return _collection.FindOneAndDeleteAsync(filter);
        }
    }
}
