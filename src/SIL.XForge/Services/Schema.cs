using System;
using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Extensions;
using JsonApiDotNetCore.Internal;

namespace SIL.XForge.Services
{
    public class Schema
    {
        private readonly HashSet<string> _types;

        public Schema(IEnumerable<string> types, IContextGraph contextGraph)
        {
            _types = new HashSet<string>(types);
            ContextGraph = contextGraph;
        }

        public IContextGraph ContextGraph { get; }

        public IEnumerable<ContextEntity> ResourceTypes => _types.Select(t => ContextGraph.GetContextEntity(t));
    }
}
