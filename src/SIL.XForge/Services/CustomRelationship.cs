using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class CustomRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : Resource
        where TOtherEntity : Entity
    {
        private readonly IResourceMapper<TOtherResource, TOtherEntity> _otherResourceMapper;
        private readonly Func<TThisEntity, Expression<Func<TOtherEntity, bool>>> _createPredicate;
        private readonly Action<IUpdateBuilder<TThisEntity>, IEnumerable<string>> _update;

        public CustomRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Func<TThisEntity, Expression<Func<TOtherEntity, bool>>> createPredicate,
            Action<IUpdateBuilder<TThisEntity>, IEnumerable<string>> update = null)
        {
            _otherResourceMapper = otherResourceMapper;
            _createPredicate = createPredicate;
            _update = update;
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TThisEntity entity)
        {
            return await _otherResourceMapper.MapMatchingAsync(included, resources,
                q => q.Where(_createPredicate(entity)));
        }

        public bool Update(IUpdateBuilder<TThisEntity> update, IEnumerable<string> ids)
        {
            if (_update == null)
                return false;

            _update(update, ids);
            return true;
        }
    }
}
