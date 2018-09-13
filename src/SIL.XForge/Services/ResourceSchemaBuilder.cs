using System.Collections.Generic;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Services
{
    public class ResourceSchemaBuilder
    {
        private readonly IContextGraphBuilder _graphBuilder;
        private readonly HashSet<string> _types;

        public ResourceSchemaBuilder()
        {
            _graphBuilder = new ContextGraphBuilder();
            _types = new HashSet<string>();
        }

        public void AddResourceType<T>(string type) where T : class, IIdentifiable<string>
        {
            _graphBuilder.AddResource<T, string>(type);
            _types.Add(type);
        }

        public ResourceSchemaService BuildService()
        {
            return new ResourceSchemaService(_types, _graphBuilder.Build());
        }
    }
}
