using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public interface IRepository<T> where T : IEntity
    {
        Task<IReadOnlyList<T>> GetAllAsync(string dbName);
        Task<T> GetAsync(string dbName, string id);
        IMongoQueryable<T> Query(string dbName);

        Task<bool> InsertAsync(string dbName, T entity);
        Task<bool> UpdateAsync(string dbName, T entity, bool upsert = false);
        Task<T> UpdateAsync(string dbName, Expression<Func<T, bool>> filter,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false);
        Task<bool> DeleteAsync(string dbName, T entity);
        Task<T> DeleteAsync(string dbName, Expression<Func<T, bool>> filter);
    }
}
