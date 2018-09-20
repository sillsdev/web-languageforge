using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Bson;
using Newtonsoft.Json;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public class MemoryRepository<T> : IRepository<T> where T : Entity, new()
    {
        public MemoryRepository()
        {
            Entities = new Dictionary<string, string>();
        }

        public MemoryRepository(IEnumerable<T> entities)
        {
            Entities = entities.ToDictionary(e => e.Id, e => JsonConvert.SerializeObject(e));
        }

        public IDictionary<string, string> Entities { get; }

        public IQueryable<T> Query()
        {
            return Entities.Values.Select(e => JsonConvert.DeserializeObject<T>(e)).AsQueryable();
        }

        public Task<bool> InsertAsync(T entity)
        {
            if (string.IsNullOrEmpty(entity.Id))
                entity.Id = ObjectId.GenerateNewId().ToString();

            if (Entities.ContainsKey(entity.Id))
                return Task.FromResult(false);

            var now = DateTime.UtcNow;
            entity.DateModified = now;
            entity.DateCreated = now;

            Entities[entity.Id] = JsonConvert.SerializeObject(entity);
            return Task.FromResult(true);
        }

        public Task<bool> ReplaceAsync(T entity, bool upsert = false)
        {
            if (string.IsNullOrEmpty(entity.Id))
                entity.Id = ObjectId.GenerateNewId().ToString();

            if (Entities.ContainsKey(entity.Id) || upsert)
            {
                var now = DateTime.UtcNow;
                entity.DateModified = now;
                if (entity.DateCreated == DateTime.MinValue)
                    entity.DateCreated = now;

                Entities[entity.Id] = JsonConvert.SerializeObject(entity);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }

        public Task<T> UpdateAsync(Expression<Func<T, bool>> filter, Action<IUpdateBuilder<T>> update,
            bool upsert = false)
        {
            T entity = Query().FirstOrDefault(filter.Compile());
            if (entity != null || upsert)
            {
                bool isInsert = entity == null;
                if (isInsert)
                    entity = new T();

                var builder = new MemoryUpdateBuilder<T>(entity, isInsert);
                update(builder);
                Entities[entity.Id] = JsonConvert.SerializeObject(entity);
            }
            return Task.FromResult(entity);
        }

        public Task<T> DeleteAsync(Expression<Func<T, bool>> filter)
        {
            T entity = Query().FirstOrDefault(filter.Compile());
            if (entity != null)
                Entities.Remove(entity.Id);
            return Task.FromResult(entity);
        }
    }
}
