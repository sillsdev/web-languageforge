using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ManyToManyForeignRelationship<TForeignEntity, TPrimaryResource, TPrimaryEntity>
        : IRelationship<TForeignEntity>
        where TForeignEntity : Entity
        where TPrimaryResource : Resource
        where TPrimaryEntity : Entity
    {
        private readonly IResourceMapper<TPrimaryResource, TPrimaryEntity> _primaryResourceMapper;
        private readonly Expression<Func<TPrimaryEntity, List<string>>> _getFieldExpr;

        public ManyToManyForeignRelationship(IResourceMapper<TPrimaryResource, TPrimaryEntity> primaryResourceMapper,
            Expression<Func<TPrimaryEntity, List<string>>> getFieldExpr)
        {
            _primaryResourceMapper = primaryResourceMapper;
            _getFieldExpr = getFieldExpr;
        }

        public async Task<IEnumerable<Resource>> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, Resource> resources, TForeignEntity entity)
        {
            return await _primaryResourceMapper.MapMatchingAsync(included, resources,
                q => q.Where(CreateContainsPredicate(entity.Id)));
        }

        private Expression<Func<TPrimaryEntity, bool>> CreateContainsPredicate(string id)
        {
            ParameterExpression ePar = Expression.Parameter(typeof(TPrimaryEntity), "e");
            var e = new ParameterRebinder(ePar);
            Expression getter = e.Visit(_getFieldExpr.Body);
            MethodInfo methodInfo = typeof(List<string>).GetMethod("Contains", new Type[] { typeof(string) });
            MethodCallExpression resultBody = Expression.Call(getter, methodInfo,
                Expression.Constant(id, typeof(string)));
            return Expression.Lambda<Func<TPrimaryEntity, bool>>(resultBody, ePar);
        }

        public bool Update(IUpdateBuilder<TForeignEntity> update, IEnumerable<string> ids)
        {
            return false;
        }
    }
}
