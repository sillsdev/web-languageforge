using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class CustomRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : class, IResource
        where TOtherEntity : class, IEntity
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

        public async Task<IEnumerable<IResource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TThisEntity entity)
        {
            return await _otherResourceMapper.MapMatchingAsync(included, resources, _createPredicate(entity));
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
