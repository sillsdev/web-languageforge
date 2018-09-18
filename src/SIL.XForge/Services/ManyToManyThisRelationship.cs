using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ManyToManyThisRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : Resource
        where TOtherEntity : Entity
    {
        private readonly IResourceQueryable<TOtherResource, TOtherEntity> _otherResources;
        private readonly Expression<Func<TThisEntity, List<string>>> _getFieldExpr;

        public ManyToManyThisRelationship(IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Expression<Func<TThisEntity, List<string>>> getFieldExpr)
        {
            _otherResources = otherResources;
            _getFieldExpr = getFieldExpr;
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TThisEntity entity)
        {
            Func<TThisEntity, List<string>> getField = _getFieldExpr.Compile();
            List<string> ids = getField(entity);
            return await _otherResources.QueryAsync(included, resources, q => q.Where(e => ids.Contains(e.Id)));
        }

        public UpdateDefinition<TThisEntity> GetUpdateOperation(UpdateDefinitionBuilder<TThisEntity> update,
            IEnumerable<string> ids)
        {
            return update.Set(_getFieldExpr, ids.ToList());
        }
    }
}
