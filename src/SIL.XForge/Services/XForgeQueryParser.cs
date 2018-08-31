using System.Collections.Generic;
using System.Linq;
using JsonApiDotNetCore.Configuration;
using JsonApiDotNetCore.Internal.Query;
using JsonApiDotNetCore.Services;

namespace SIL.XForge.Services
{
    public class XForgeQueryParser : QueryParser
    {
        public XForgeQueryParser(IControllerContext controllerContext, JsonApiOptions options)
            : base(controllerContext, options)
        {
        }

        protected override List<string> ParseIncludedRelationships(string value)
        {
            return value
                .Split(QueryConstants.COMMA)
                .ToList();
        }
    }
}
