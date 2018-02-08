using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.WebApi.Server.Models;
using SIL.XForge.WebApi.Server.Utils;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public interface IRepository<T> where T : IEntity
    {
        Task<IReadOnlyList<T>> GetAllAsync();
        Task<Attempt<T>> TryGetAsync(string id);
        IMongoQueryable<T> Query();

        Task<bool> InsertAsync(T entity);
        Task<bool> UpdateAsync(T entity, bool upsert = false);
        Task<T> UpdateAsync(Expression<Func<T, bool>> filter,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false);
        Task<T> DeleteAsync(Expression<Func<T, bool>> filter);
    }
}
