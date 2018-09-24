using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
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
        private readonly bool _updateAllowed;
        private readonly Func<TThisEntity, string> _getField;

        public ManyToOneRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TThisEntity, string>> getFieldExpr, bool updateAllowed = true)
        {
            _otherResourceMapper = otherResourceMapper;
            _getFieldExpr = getFieldExpr;
            _updateAllowed = updateAllowed;
            _getField = _getFieldExpr.Compile();
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TThisEntity entity)
        {
            string id = _getField(entity);
            return await _otherResourceMapper.MapMatchingAsync(included, resources, q => q.Where(e => e.Id == id));
        }

        public bool Update(IUpdateBuilder<TThisEntity> update, IEnumerable<string> ids)
        {
            if (!_updateAllowed)
                return false;
            update.Set(_getFieldExpr, ids.Single());
            return true;
        }
    }
}
