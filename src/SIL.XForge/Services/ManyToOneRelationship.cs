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
    public class ManyToOneRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : Resource
        where TOtherEntity : Entity
    {
        private readonly IResourceMapper<TOtherResource, TOtherEntity> _otherResourceMapper;
        private readonly Expression<Func<TThisEntity, string>> _getFieldExpr;

        public ManyToOneRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TThisEntity, string>> getFieldExpr)
        {
            _otherResourceMapper = otherResourceMapper;
            _getFieldExpr = getFieldExpr;
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TThisEntity entity)
        {
            Func<TThisEntity, string> getField = _getFieldExpr.Compile();
            string id = getField(entity);
            return await _otherResourceMapper.MapMatchingAsync(included, resources, q => q.Where(e => e.Id == id));
        }

        public UpdateDefinition<TThisEntity> GetUpdateOperation(UpdateDefinitionBuilder<TThisEntity> update,
            IEnumerable<string> ids)
        {
            return update.Set(_getFieldExpr, ids.Single());
        }
    }
}
