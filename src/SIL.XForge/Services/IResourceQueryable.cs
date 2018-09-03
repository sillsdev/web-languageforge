using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public interface IResourceQueryable<TResource, TEntity>
        where TResource : Resource
        where TEntity : Entity
    {
        Task<IEnumerable<TResource>> QueryAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources,
            Func<IMongoQueryable<TEntity>, IMongoQueryable<TEntity>> querySelector);
    }
}
