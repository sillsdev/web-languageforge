using SIL.XForge.WebApi.Server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SIL.XForge.WebApi.Server.DataAccess
{
    public interface IRepository<T> where T : IEntity
    {
        Task<IReadOnlyList<T>> GetAllAsync(string dbName);
        Task<T> GetAsync(string dbName, string id);
        Task InsertAsync(string dbName, T entity);
        Task<bool> UpdateAsync(string dbName, T entity);
        Task<bool> DeleteAsync(string dbName, T entity);
        Task<bool> DeleteAsync(string dbName, string id);
    }
}
