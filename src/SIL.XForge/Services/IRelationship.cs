using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IRelationship<T> where T : class, IEntity
    {
        Task<object> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, T entity);

        UpdateDefinition<T> GetUpdateOperation(UpdateDefinitionBuilder<T> update,
            IEnumerable<string> ids);
    }
}
