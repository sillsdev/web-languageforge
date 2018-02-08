using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.AspNetCore.Mvc.Controllers;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace SIL.XForge.WebApi.Server.Documentation
{
    public class RequiredParameterOperationFilter : IOperationFilter
    {
        public void Apply(Operation operation, OperationFilterContext context)
        {
            foreach (ApiParameterDescription paramDesc in context.ApiDescription.ParameterDescriptions)
            {
                var controllerParamDesc = paramDesc.ParameterDescriptor as ControllerParameterDescriptor;
                if (controllerParamDesc != null && controllerParamDesc.ParameterInfo.CustomAttributes
                    .Any(cad => cad.AttributeType == typeof(RequiredAttribute)))
                {
                    IParameter param = operation.Parameters.FirstOrDefault(p => p.Name == paramDesc.Name);
                    if (param != null)
                        param.Required = true;
                }
            }
        }
    }
}
