using Microsoft.AspNetCore.Authorization;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;

namespace SIL.XForge.WebApi.Server.Documentation
{
    public class AuthOperationFilter : IOperationFilter
    {
        public void Apply(Operation operation, OperationFilterContext context)
        {
            if (context.ApiDescription.ActionAttributes().All(a => a.GetType() != typeof(AllowAnonymousAttribute)))
            {
                var security = new Dictionary<string, IEnumerable<string>> { { "bearer", new string[0] } };
                operation.Security = new[] { security };
                operation.Responses.Add("401", new Response { Description = "Unauthorized" });
                operation.Responses.Add("403",
                    new Response { Description = "The user does not have permission to perform this operation." });
            }
        }
    }
}
