using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.Services
{
    public class OneToManyRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : Entity
        where TOtherResource : class, IResource
        where TOtherEntity : class, IEntity
    {
        private readonly IResourceMapper<TOtherResource, TOtherEntity> _otherResourceMapper;
        private readonly Expression<Func<TOtherEntity, string>> _getFieldExpr;

        public OneToManyRelationship(IResourceMapper<TOtherResource, TOtherEntity> otherResourceMapper,
            Expression<Func<TOtherEntity, string>> getFieldExpr)
        {
            _otherResourceMapper = otherResourceMapper;
            _getFieldExpr = getFieldExpr;
        }

        public async Task<IEnumerable<IResource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TThisEntity entity)
        {
            return await _otherResourceMapper.MapMatchingAsync(included, resources, CreateEqualPredicate(entity.Id));
        }

        private Expression<Func<TOtherEntity, bool>> CreateEqualPredicate(string id)
        {
            ParameterExpression ePar = Expression.Parameter(typeof(TOtherEntity), "e");
            var getter = (MemberExpression)ExpressionUtils.RebindParameter(ePar, _getFieldExpr);
            BinaryExpression resultBody = Expression.Equal(getter, Expression.Constant(id, typeof(string)));
            return Expression.Lambda<Func<TOtherEntity, bool>>(resultBody, ePar);
        }

        public bool Update(IUpdateBuilder<TThisEntity> update, IEnumerable<string> ids)
        {
            return false;
        }
    }
}
