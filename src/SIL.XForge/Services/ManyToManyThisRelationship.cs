using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ManyToManyThisRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : Resource
        where TOtherEntity : Entity
    {
        private readonly IResourceMapper<TOtherResource, TOtherEntity> _otherResourceMapper;
        private readonly Expression<Func<TThisEntity, List<string>>> _getFieldExpr;
        private readonly bool _updateAllowed;

        public ManyToManyThisRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TThisEntity, List<string>>> getFieldExpr, bool updateAllowed = true)
        {
            _otherResourceMapper = otherResourceMapper;
            _getFieldExpr = getFieldExpr;
            _updateAllowed = updateAllowed;
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TThisEntity entity)
        {
            Func<TThisEntity, List<string>> getField = _getFieldExpr.Compile();
            List<string> ids = getField(entity);
            return await _otherResourceMapper.MapMatchingAsync(included, resources,
                q => q.Where(e => ids.Contains(e.Id)));
        }

        public bool Update(IUpdateBuilder<TThisEntity> update, IEnumerable<string> ids)
        {
            if (!_updateAllowed)
                return false;
            update.Set(_getFieldExpr, ids.ToList());
            return true;
        }
    }
}
