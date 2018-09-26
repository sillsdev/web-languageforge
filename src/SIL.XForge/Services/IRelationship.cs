using System.Collections.Generic;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IRelationship<T> where T : Entity
    {
        Task<IEnumerable<IResource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, T entity);

        bool Update(IUpdateBuilder<T> update, IEnumerable<string> ids);
    }
}
