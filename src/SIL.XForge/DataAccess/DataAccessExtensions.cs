using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.DataAccess
{
    public static class DataAccessExtensions
    {
        public static Task<T> UpdateAsync<T>(this IRepository<T> repo, string id,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false) where T : Entity
        {
            return repo.UpdateAsync(e => e.Id == id, update, upsert);
        }

        public static Task<T> UpdateAsync<T>(this IRepository<T> repo, T entity,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false) where T : Entity
        {
            return repo.UpdateAsync(entity.Id, update, upsert);
        }

        public static async Task<T> DeleteAsync<T>(this IRepository<T> repo, string id) where T : Entity
        {
            return await repo.DeleteAsync(e => e.Id == id);
        }

        public static async Task<bool> DeleteAsync<T>(this IRepository<T> repo, T entity) where T : Entity
        {
            return (await repo.DeleteAsync(e => e.Id == entity.Id)) != null;
        }

        public static async Task<T> GetAsync<T>(this IRepository<T> repo, string id) where T : Entity
        {
            Attempt<T> attempt = await repo.TryGetAsync(id);
            if (attempt.Success)
                return attempt.Result;
            return default(T);
        }

        public static async Task<IReadOnlyList<T>> GetAllAsync<T>(this IRepository<T> repo) where T : Entity
        {
            return await repo.Query().ToListAsync();
        }

        public static async Task<Attempt<T>> TryGetAsync<T>(this IRepository<T> repo, string id) where T : Entity
        {
            T entity = await repo.Query().Where(e => e.Id == id).FirstOrDefaultAsync();
            return new Attempt<T>(entity != null, entity);
        }

        public static async Task<T> FirstOrDefaultAsync<T>(this IQueryable<T> queryable)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.FirstOrDefaultAsync(mongoQueryable);
            else
                return queryable.FirstOrDefault();
        }

        public static async Task<T> FirstOrDefaultAsync<T>(this IQueryable<T> queryable,
            Expression<Func<T, bool>> predicate)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.FirstOrDefaultAsync(mongoQueryable, predicate);
            else
                return queryable.FirstOrDefault(predicate);
        }

        public static async Task<T> SingleOrDefaultAsync<T>(this IQueryable<T> queryable)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.SingleOrDefaultAsync(mongoQueryable);
            else
                return queryable.SingleOrDefault();
        }

        public static async Task<T> SingleOrDefaultAsync<T>(this IQueryable<T> queryable,
            Expression<Func<T, bool>> predicate)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.SingleOrDefaultAsync(mongoQueryable, predicate);
            else
                return queryable.SingleOrDefault(predicate);
        }

        public static async Task<int> CountAsync<T>(this IQueryable<T> queryable)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.CountAsync(mongoQueryable);
            else
                return queryable.Count();
        }

        public static async Task<int> CountAsync<T>(this IQueryable<T> queryable, Expression<Func<T, bool>> predicate)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.CountAsync(mongoQueryable, predicate);
            else
                return queryable.Count(predicate);
        }

        public static async Task<bool> AnyAsync<T>(this IQueryable<T> queryable)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.AnyAsync(mongoQueryable);
            else
                return queryable.Any();
        }

        public static async Task<bool> AnyAsync<T>(this IQueryable<T> queryable, Expression<Func<T, bool>> predicate)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await MongoQueryable.AnyAsync(mongoQueryable, predicate);
            else
                return queryable.Any(predicate);
        }

        public static async Task<List<T>> ToListAsync<T>(this IQueryable<T> queryable)
        {
            if (queryable is IMongoQueryable<T> mongoQueryable)
                return await IAsyncCursorSourceExtensions.ToListAsync(mongoQueryable);
            else
                return queryable.ToList();
        }

        public static async Task<List<TResult>> ToListAsync<TSource, TResult>(this IQueryable<TSource> queryable,
            Func<TSource, Task<TResult>> selector)
        {
            var results = new List<TResult>();
            if (queryable is IMongoQueryable<TSource> mongoQueryable)
            {
                using (IAsyncCursor<TSource> cursor = await mongoQueryable.ToCursorAsync())
                {
                    while (await cursor.MoveNextAsync())
                    {
                        foreach (TSource entity in cursor.Current)
                            results.Add(await selector(entity));
                    }
                }
            }
            else
            {
                foreach (TSource entity in queryable)
                    results.Add(await selector(entity));
            }
            return results;
        }

        public static Task<List<TResult>> ToListAsync<TSource, TResult>(this IQueryable<TSource> query,
            Func<TSource, TResult> selector)
        {
            return query.ToListAsync(e => Task.FromResult(selector(e)));
        }
    }
}
