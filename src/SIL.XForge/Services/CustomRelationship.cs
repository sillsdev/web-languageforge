using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using JsonApiDotNetCore.Internal;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public class CustomRelationship<TThisEntity, TOtherResource, TOtherEntity> : IRelationship<TThisEntity>
        where TThisEntity : class, IEntity
        where TOtherResource : class, IResource
        where TOtherEntity : class, IEntity
    {
        private readonly IResourceQueryable<TOtherResource, TOtherEntity> _otherResources;
        private readonly Func<TThisEntity, Expression<Func<TOtherEntity, bool>>> _createPredicate;
        private readonly Func<UpdateDefinitionBuilder<TThisEntity>, IEnumerable<string>, UpdateDefinition<TThisEntity>> _createOperation;

        public CustomRelationship(IResourceQueryable<TOtherResource, TOtherEntity> otherResources,
            Func<TThisEntity, Expression<Func<TOtherEntity, bool>>> createPredicate,
            Func<UpdateDefinitionBuilder<TThisEntity>, IEnumerable<string>, UpdateDefinition<TThisEntity>> createOperation = null)
        {
            _otherResources = otherResources;
            _createPredicate = createPredicate;
            _createOperation = createOperation;
        }

        public async Task<object> GetResourcesAsync(IEnumerable<string> included,
            Dictionary<string, IResource> resources, TThisEntity entity)
        {
            return await _otherResources.QueryAsync(included, resources, q => q.Where(_createPredicate(entity)));
        }

        public UpdateDefinition<TThisEntity> GetUpdateOperation(UpdateDefinitionBuilder<TThisEntity> update,
            IEnumerable<string> ids)
        {
            if (_createOperation == null)
                throw new JsonApiException(StatusCodes.Status400BadRequest, "The relationship cannot be updated.");
            return _createOperation(update, ids);
        }
    }
}
