using System.Threading.Tasks;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IProjectDataMapper<TResource, TEntity> : IResourceMapper<TResource, TEntity>
        where TResource : class, IResource
        where TEntity : class, IEntity
    {
        Task DeleteAllAsync(string projectId);
    }
}
