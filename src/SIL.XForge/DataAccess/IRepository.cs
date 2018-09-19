using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public interface IRepository<T> where T : Entity
    {
        IMongoQueryable<T> Query();

        Task<bool> InsertAsync(T entity);
        Task<bool> ReplaceAsync(T entity, bool upsert = false);
        Task<T> UpdateAsync(Expression<Func<T, bool>> filter,
            Func<UpdateDefinitionBuilder<T>, UpdateDefinition<T>> update, bool upsert = false);
        Task<T> DeleteAsync(Expression<Func<T, bool>> filter);
    }
}
