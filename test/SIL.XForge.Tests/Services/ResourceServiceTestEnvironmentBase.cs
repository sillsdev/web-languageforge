using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;
using NSubstitute;
using SIL.XForge.DataAccess;
using SIL.XForge.Models;

namespace SIL.XForge.Services
{
    public abstract class ResourceServiceTestEnvironmentBase<TResource, TEntity>
        where TResource : Resource
        where TEntity : Entity, new()
    {
        private readonly string _resourceName;

        protected ResourceServiceTestEnvironmentBase(string resourceName)
        {
            _resourceName = resourceName;

            var contextGraphBuilder = new ContextGraphBuilder();
            contextGraphBuilder.AddResource<TResource, string>(_resourceName);
            SetupContextGraph(contextGraphBuilder);
            ContextGraph = contextGraphBuilder.Build();

            JsonApiContext = Substitute.For<IJsonApiContext>();
            JsonApiContext.ContextGraph.Returns(ContextGraph);
            JsonApiContext.RequestEntity.Returns(ContextGraph.GetContextEntity(_resourceName));
            JsonApiContext.Options.Returns(new JsonApiOptions { IncludeTotalRecordCount = true });

            Entities = new MemoryRepository<TEntity>(GetInitialData());

            var config = new MapperConfiguration(cfg =>
                {
                    SetupMapper(cfg);
                    cfg.IgnoreAllUnmapped();
                });
            Mapper = config.CreateMapper();
            UserAccessor = Substitute.For<IUserAccessor>();
            UserAccessor.IsAuthenticated.Returns(false);
        }

        public IContextGraph ContextGraph { get; }
        public IJsonApiContext JsonApiContext { get; }
        public IUserAccessor UserAccessor { get; }
        public MemoryRepository<TEntity> Entities { get; }
        public IMapper Mapper { get; }

        public void SetUser(string userId, string role)
        {
            UserAccessor.IsAuthenticated.Returns(true);
            UserAccessor.UserId.Returns(userId);
            UserAccessor.SystemRole.Returns(role);
        }

        public AttrAttribute GetAttribute(string name)
        {
            ContextEntity resourceType = ContextGraph.GetContextEntity(_resourceName);
            return resourceType.Attributes.First(a => a.PublicAttributeName == name);
        }

        public RelationshipAttribute GetRelationship(string name)
        {
            ContextEntity resourceType = ContextGraph.GetContextEntity(_resourceName);
            return resourceType.Relationships.First(r => r.PublicRelationshipName == name);
        }

        protected virtual IEnumerable<TEntity> GetInitialData()
        {
            return Enumerable.Empty<TEntity>();
        }

        protected virtual void SetupContextGraph(IContextGraphBuilder builder)
        {
        }

        protected virtual void SetupMapper(IMapperConfigurationExpression config)
        {
        }
    }
}
