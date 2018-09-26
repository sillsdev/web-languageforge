using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IResourceMapper<TResource, TEntity>
        where TResource : class, IResource
        where TEntity : class, IEntity
    {
        Task<TResource> MapAsync(IEnumerable<string> included, Dictionary<string, IResource> resources,
            TEntity entity);

        Task<IEnumerable<TResource>> MapMatchingAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, Expression<Func<TEntity, bool>> predicate);
    }
}
