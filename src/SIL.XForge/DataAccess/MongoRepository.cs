using System;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public class MongoRepository<T> : IRepository<T> where T : Entity
    {
        private readonly IMongoCollection<T> _collection;
        private readonly Action<IMongoCollection<T>> _init;

        public MongoRepository(IMongoCollection<T> collection, Action<IMongoCollection<T>> init)
        {
            _collection = collection;
            _init = init;
        }

        public void Init()
        {
            _init(_collection);
        }

        public IQueryable<T> Query()
        {
            return _collection.AsQueryable();
        }

        public async Task InsertAsync(T entity)
        {
            try
            {
                var now = DateTime.UtcNow;
                entity.DateModified = now;
                entity.DateCreated = now;
                await _collection.InsertOneAsync(entity);
            }
            catch (MongoWriteException e)
            {
                if (e.WriteError.Category == ServerErrorCategory.DuplicateKey)
                    throw new DuplicateKeyException();
                throw;
            }
        }

        public async Task<bool> ReplaceAsync(T entity, bool upsert = false)
        {
            try
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
            catch (MongoWriteException e)
            {
                if (e.WriteError.Category == ServerErrorCategory.DuplicateKey)
                    throw new DuplicateKeyException();
                throw;
            }
        }

        public async Task<T> UpdateAsync(Expression<Func<T, bool>> filter, Action<IUpdateBuilder<T>> update,
            bool upsert = false)
        {
            try
            {
                var now = DateTime.UtcNow;
                var updateBuilder = new MongoUpdateBuilder<T>();
                update(updateBuilder);
                UpdateDefinition<T> updateDef = updateBuilder.Build()
                    .Set(e => e.DateModified, now)
                    .SetOnInsert(e => e.DateCreated, now);
                return await _collection.FindOneAndUpdateAsync(filter, updateDef,
                    new FindOneAndUpdateOptions<T>
                    {
                        IsUpsert = upsert,
                        ReturnDocument = ReturnDocument.After
                    });
            }
            catch (MongoWriteException e)
            {
                if (e.WriteError.Category == ServerErrorCategory.DuplicateKey)
                    throw new DuplicateKeyException();
                throw;
            }
        }

        public Task<T> DeleteAsync(Expression<Func<T, bool>> filter)
        {
            return _collection.FindOneAndDeleteAsync(filter);
        }

        public async Task<int> DeleteAllAsync(Expression<Func<T, bool>> filter)
        {
            DeleteResult result = await _collection.DeleteManyAsync(filter);
            return (int)result.DeletedCount;
        }
    }
}
