using System;
using System.Collections.Generic;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Models;

namespace SIL.XForge.Services
{
    public class SchemaBuilder
    {
        private readonly IContextGraphBuilder _graphBuilder;
        private readonly HashSet<string> _types;

        public SchemaBuilder()
        {
            _graphBuilder = new ContextGraphBuilder();
            _types = new HashSet<string>();
        }

        public void AddResourceType<T>(string type) where T : class, IIdentifiable<string>
        {
            _graphBuilder.AddResource<T, string>(type);
            _types.Add(type);
        }

        public Schema Build()
        {
            return new Schema(_types, _graphBuilder.Build());
        }
    }
}
