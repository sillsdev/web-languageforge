using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ManyToManyPrimaryRelationship<TPrimaryEntity, TForeignResource, TForeignEntity>
        : IRelationship<TPrimaryEntity>
        where TPrimaryEntity : Entity
        where TForeignResource : Resource
        where TForeignEntity : Entity
    {
        private readonly IResourceMapper<TForeignResource, TForeignEntity> _foreignResourceMapper;
        private readonly Expression<Func<TPrimaryEntity, List<string>>> _getFieldExpr;
        private readonly bool _updateAllowed;
        private readonly Func<TPrimaryEntity, List<string>> _getField;

        public ManyToManyPrimaryRelationship(IResourceMapper<TForeignResource, TForeignEntity> foreignResourceMapper,
            Expression<Func<TPrimaryEntity, List<string>>> getFieldExpr, bool updateAllowed = true)
        {
            _foreignResourceMapper = foreignResourceMapper;
            _getFieldExpr = getFieldExpr;
            _updateAllowed = updateAllowed;
            _getField = _getFieldExpr.Compile();
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TPrimaryEntity entity)
        {
            List<string> ids = _getField(entity);
            return await _foreignResourceMapper.MapMatchingAsync(included, resources,
                q => q.Where(e => ids.Contains(e.Id)));
        }

        public bool Update(IUpdateBuilder<TPrimaryEntity> update, IEnumerable<string> ids)
        {
            if (!_updateAllowed)
                return false;
            update.Set(_getFieldExpr, ids.ToList());
            return true;
        }
    }
}
