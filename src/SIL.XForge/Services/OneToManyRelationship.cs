using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class OneToManyRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : Resource
        where TOtherEntity : Entity
    {
        private readonly IResourceMapper<TOtherResource, TOtherEntity> _otherResourceMapper;
        private readonly Expression<Func<TOtherEntity, string>> _getFieldExpr;

        public OneToManyRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TOtherEntity, string>> getFieldExpr)
        {
            _otherResourceMapper = otherResourceMapper;
            _getFieldExpr = getFieldExpr;
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TThisEntity entity)
        {
            return await _otherResourceMapper.MapMatchingAsync(included, resources,
                q => q.Where(CreateEqualPredicate(entity.Id)));
        }

        private Expression<Func<TOtherEntity, bool>> CreateEqualPredicate(string id)
        {
            ParameterExpression ePar = Expression.Parameter(typeof(TOtherEntity), "e");
            var e = new ParameterRebinder(ePar);
            var getter = (MemberExpression) e.Visit(_getFieldExpr.Body);
            BinaryExpression resultBody = Expression.Equal(getter, Expression.Constant(id, typeof(string)));
            return Expression.Lambda<Func<TOtherEntity, bool>>(resultBody, ePar);
        }

        public bool Update(IUpdateBuilder<TThisEntity> update, IEnumerable<string> ids)
        {
            return false;
        }
    }
}
