using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IResourceMapper<TResource, TEntity>
        where TResource : Resource
        where TEntity : Entity
    {
        Task<TResource> MapAsync(IEnumerable<string> included, Dictionary<string, Resource> resources,
            TEntity entity);

        Task<IEnumerable<TResource>> MapMatchingAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, Func<IQueryable<TEntity>, IQueryable<TEntity>> querySelector);
    }
}
