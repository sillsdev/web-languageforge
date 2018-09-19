using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public class MongoRepository<T> : IRepository<T> where T : Entity
    {
        private readonly IMongoCollection<T> _collection;

        public MongoRepository(IMongoCollection<T> collection)
        {
            _collection = collection;
        }

        public IMongoQueryable<T> Query()
        {
            return _collection.AsQueryable();
        }

        public async Task<bool> InsertAsync(T entity)
        {
            try
            {
                var now = DateTime.UtcNow;
                entity.DateModified = now;
                entity.DateCreated = now;
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

        public async Task<bool> ReplaceAsync(T entity, bool upsert = false)
        {
            var now = DateTime.UtcNow;
            entity.DateModified = now;
            if (entity.DateCreated == DateTime.MinValue)
                entity.DateCreated = now;
            ReplaceOneResult result = await _collection.ReplaceOneAsync(e => e.Id == entity.Id, entity,
                new UpdateOptions { IsUpsert = upsert });
            if (result.IsAcknowledged)
                return upsert || result.MatchedCount > 0;
            return false;
        }

        public async Task<T> UpdateAsync(Expression<Func<T, bool>> filter,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false)
        {
            var now = DateTime.UtcNow;
            return await _collection.FindOneAndUpdateAsync(filter,
                update(Builders<T>.Update)
                    .Set(e => e.DateModified, now)
                    .SetOnInsert(e => e.DateCreated, now),
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
