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
        public static Task<T> UpdateAsync<T>(this IRepository<T> repo, string id, Action<IUpdateBuilder<T>> update,
            bool upsert = false) where T : Entity
        {
            return repo.UpdateAsync(e => e.Id == id, update, upsert);
        }

        public static Task<T> UpdateAsync<T>(this IRepository<T> repo, T entity, Action<IUpdateBuilder<T>> update,
            bool upsert = false) where T : Entity
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

        public static IUpdateBuilder<T> Set<T, TField>(this IUpdateBuilder<T> update, Expression<Func<T, TField>> field,
            TField value) where T : Entity
        {
            return update.Set(GetPropertyName(field), value);
        }

        public static IUpdateBuilder<T> Set<T, TItem, TField>(this IUpdateBuilder<T> update,
            Expression<Func<T, IEnumerable<TItem>>> collectionField, Expression<Func<TItem, TField>> field,
            TField value, int index = -1) where T : Entity
        {
            return update.Set(GetPropertyName(collectionField), GetPropertyName(field), value, index);
        }

        public static IUpdateBuilder<T> Set<T, TItem, TField>(this IUpdateBuilder<T> update,
            Expression<Func<T, IEnumerable<TItem>>> collectionField, string fieldName, TField value,
            int index = -1) where T : Entity
        {
            return update.Set(GetPropertyName(collectionField), fieldName, value, index);
        }

        public static IUpdateBuilder<T> SetDictionaryValue<T, TItem, TField>(this IUpdateBuilder<T> update,
            Expression<Func<T, IDictionary<string, TItem>>> dictionaryField, string key, TField value) where T : Entity
        {
            return update.SetDictionaryValue(GetPropertyName(dictionaryField), key, value);
        }

        public static IUpdateBuilder<T> RemoveDictionaryValue<T, TItem>(this IUpdateBuilder<T> update,
            Expression<Func<T, IDictionary<string, TItem>>> dictionaryField, string key) where T : Entity
        {
            return update.RemoveDictionaryValue(GetPropertyName(dictionaryField), key);
        }

        public static IUpdateBuilder<T> SetOnInsert<T, TField>(this IUpdateBuilder<T> update,
            Expression<Func<T, TField>> field, TField value) where T : Entity
        {
            return update.SetOnInsert(GetPropertyName(field), value);
        }

        public static IUpdateBuilder<T> Unset<T, TField>(this IUpdateBuilder<T> update,
            Expression<Func<T, TField>> field) where T : Entity
        {
            return update.Unset(GetPropertyName(field));
        }

        public static IUpdateBuilder<T> Inc<T>(this IUpdateBuilder<T> update, Expression<Func<T, int>> field, int value)
            where T : Entity
        {
            return update.Inc(GetPropertyName(field), value);
        }

        public static IUpdateBuilder<T> RemoveAll<T, TItem>(this IUpdateBuilder<T> update,
            Expression<Func<T, IEnumerable<TItem>>> field, Expression<Func<TItem, bool>> predicate) where T : Entity
        {
            return update.RemoveAll(GetPropertyName(field), predicate);
        }

        public static IUpdateBuilder<T> Add<T, TItem>(this IUpdateBuilder<T> update,
            Expression<Func<T, IEnumerable<TItem>>> field, TItem value) where T : Entity
        {
            return update.Add(GetPropertyName(field), value);
        }

        public static void CreateOrUpdate<T>(this IMongoIndexManager<T> indexes, CreateIndexModel<T> indexModel)
        {
            try
            {
                indexes.CreateOne(indexModel);
            }
            catch (MongoCommandException ex)
            {
                if (ex.CodeName == "IndexOptionsConflict")
                {
                    string name = ex.Command["indexes"][0]["name"].AsString;
                    indexes.DropOne(name);
                    indexes.CreateOne(indexModel);
                }
                else
                {
                    throw;
                }
            }
        }

        public static Task<UserEntity> UpdateByIdentifierAsync(this IRepository<UserEntity> users,
            string userIdentifier, Action<IUpdateBuilder<UserEntity>> update, bool upsert = false)
        {
            return users.UpdateAsync(UserIdentifierFilter(userIdentifier), update, upsert);
        }

        public static async Task<Attempt<UserEntity>> TryGetByIdentifier(this IRepository<UserEntity> users,
            string userIdentifier)
        {
            UserEntity user = await users.Query().SingleOrDefaultAsync(UserIdentifierFilter(userIdentifier));
            return new Attempt<UserEntity>(user != null, user);
        }

        private static Expression<Func<UserEntity, bool>> UserIdentifierFilter(string userIdentifier)
        {
            return u => u.Username == UserEntity.NormalizeUsername(userIdentifier)
                || u.CanonicalEmail == UserEntity.CanonicalizeEmail(userIdentifier);
        }

        private static string GetPropertyName<T, TField>(Expression<Func<T, TField>> field)
        {
            var body = (MemberExpression)field.Body;
            return body.Member.Name;
        }
    }
}
