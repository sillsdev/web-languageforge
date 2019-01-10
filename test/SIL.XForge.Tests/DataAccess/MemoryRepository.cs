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
        private readonly Dictionary<string, string> _entities;
        private readonly Func<T, object>[] _uniqueKeySelectors;
        private readonly HashSet<object>[] _uniqueKeys;

        public MemoryRepository(IEnumerable<T> entities)
            : this(null, entities)
        {
        }

        public MemoryRepository(IEnumerable<Func<T, object>> uniqueKeySelectors = null, IEnumerable<T> entities = null)
        {
            _uniqueKeySelectors = uniqueKeySelectors?.ToArray() ?? new Func<T, object>[0];
            _uniqueKeys = new HashSet<object>[_uniqueKeySelectors.Length];
            for (int i = 0; i < _uniqueKeys.Length; i++)
                _uniqueKeys[i] = new HashSet<object>();

            _entities = new Dictionary<string, string>();
            if (entities != null)
                Add(entities);
        }

        public void Add(T entity)
        {
            for (int i = 0; i < _uniqueKeySelectors.Length; i++)
            {
                object key = _uniqueKeySelectors[i](entity);
                if (key != null)
                    _uniqueKeys[i].Add(key);
            }
            _entities[entity.Id] = JsonConvert.SerializeObject(entity);
        }

        public void Add(IEnumerable<T> entities)
        {
            foreach (T entity in entities)
                Add(entity);
        }

        public void Remove(T entity)
        {
            for (int i = 0; i < _uniqueKeySelectors.Length; i++)
            {
                object key = _uniqueKeySelectors[i](entity);
                if (key != null)
                    _uniqueKeys[i].Remove(key);
            }
            _entities.Remove(entity.Id);
        }

        public void Replace(T entity)
        {
            if (_entities.TryGetValue(entity.Id, out string existingStr))
            {
                T existing = JsonConvert.DeserializeObject<T>(existingStr);
                Remove(existing);
            }
            Add(entity);
        }

        public bool Contains(string id)
        {
            return _entities.ContainsKey(id);
        }

        public IQueryable<T> Query()
        {
            return _entities.Values.Select(e => JsonConvert.DeserializeObject<T>(e)).AsQueryable();
        }

        public Task<bool> InsertAsync(T entity)
        {
            if (string.IsNullOrEmpty(entity.Id))
                entity.Id = ObjectId.GenerateNewId().ToString();

            if (_entities.ContainsKey(entity.Id))
                return Task.FromResult(false);

            if (CheckDuplicateKeys(entity))
                return Task.FromResult(false);

            var now = DateTime.UtcNow;
            entity.DateModified = now;
            entity.DateCreated = now;

            Add(entity);
            return Task.FromResult(true);
        }

        public Task<bool> ReplaceAsync(T entity, bool upsert = false)
        {
            if (string.IsNullOrEmpty(entity.Id))
                entity.Id = ObjectId.GenerateNewId().ToString();

            if (_entities.ContainsKey(entity.Id) || upsert)
            {
                var now = DateTime.UtcNow;
                entity.DateModified = now;
                if (entity.DateCreated == DateTime.MinValue)
                    entity.DateCreated = now;

                Replace(entity);
                return Task.FromResult(true);
            }
            return Task.FromResult(false);
        }

        public Task<T> UpdateAsync(Expression<Func<T, bool>> filter, Action<IUpdateBuilder<T>> update,
            bool upsert = false)
        {
            T entity = Query().FirstOrDefault(filter);
            if (entity != null || upsert)
            {
                bool isInsert = entity == null;
                if (isInsert)
                {
                    entity = new T();
                    entity.Id = ObjectId.GenerateNewId().ToString();
                }

                var builder = new MemoryUpdateBuilder<T>(filter, entity, isInsert);
                update(builder);
                Replace(entity);
            }
            return Task.FromResult(entity);
        }

        public Task<T> DeleteAsync(Expression<Func<T, bool>> filter)
        {
            T entity = Query().FirstOrDefault(filter);
            if (entity != null)
                Remove(entity);
            return Task.FromResult(entity);
        }

        private bool CheckDuplicateKeys(T entity)
        {
            for (int i = 0; i < _uniqueKeySelectors.Length; i++)
            {
                object key = _uniqueKeySelectors[i](entity);
                if (key != null)
                {
                    if (_uniqueKeys[i].Contains(key))
                        return true;
                }
            }
            return false;
        }
    }
}
