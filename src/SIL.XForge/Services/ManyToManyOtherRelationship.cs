using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class ManyToManyOtherRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : class, IEntity
        where TOtherResource : class, IResource
        where TOtherEntity : class, IEntity
    {
        private readonly IResourceQueryable<TOtherResource, TOtherEntity> _otherResources;
        private readonly Expression<Func<TOtherEntity, List<string>>> _getFieldExpr;

        public ManyToManyOtherRelationship(IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Expression<Func<TOtherEntity, List<string>>> getFieldExpr)
        {
            _otherResources = otherResources;
            _getFieldExpr = getFieldExpr;
        }

        public async Task<object> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TThisEntity entity)
        {
            return await _otherResources.QueryAsync(included, resources,
                q => q.Where(CreateContainsPredicate(entity.Id)));
        }

        private Expression<Func<TOtherEntity, bool>> CreateContainsPredicate(string id)
        {
            ParameterExpression ePar = Expression.Parameter(typeof(TOtherEntity), "e");
            var e = new ParameterRebinder(ePar);
            Expression getter = e.Visit(_getFieldExpr.Body);
            MethodInfo methodInfo = typeof(List<string>).GetMethod("Contains", new Type[] { typeof(string) });
            MethodCallExpression resultBody = Expression.Call(getter, methodInfo,
                Expression.Constant(id, typeof(string)));
            return Expression.Lambda<Func<TOtherEntity, bool>>(resultBody, ePar);
        }

        public UpdateDefinition<TThisEntity> GetUpdateOperation(UpdateDefinitionBuilder<TThisEntity> update,
            IEnumerable<string> ids)
        {
            throw new JsonApiException(StatusCodes.Status400BadRequest, "The relationship cannot be updated.");
        }
    }
}
