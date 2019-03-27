using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class HasOneRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : class, IResource
        where TOtherEntity : class, IEntity
    {
        private readonly IResourceMapper<TOtherResource, TOtherEntity> _otherResourceMapper;
        private readonly Expression<Func<TThisEntity, string>> _getFieldExpr;
        private readonly bool _updateAllowed;
        private readonly Func<TThisEntity, string> _getField;

        public HasOneRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TThisEntity, string>> getFieldExpr, bool updateAllowed = true)
        {
            _otherResourceMapper = otherResourceMapper;
            _getFieldExpr = getFieldExpr;
            _updateAllowed = updateAllowed;
            _getField = _getFieldExpr.Compile();
        }

        public async Task<IEnumerable<IResource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TThisEntity entity)
        {
            string id = _getField(entity);
            return await _otherResourceMapper.MapMatchingAsync(included, resources, e => e.Id == id);
        }

        public bool Update(IUpdateBuilder<TThisEntity> update, IEnumerable<string> ids)
        {
            if (!_updateAllowed)
                return false;
            string id = ids.Single();
            if (id == null)
                update.Unset(_getFieldExpr);
            else
                update.Set(_getFieldExpr, id);
            return true;
        }
    }
}
