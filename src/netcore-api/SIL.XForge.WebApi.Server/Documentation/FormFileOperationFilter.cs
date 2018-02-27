using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace SIL.XForge.WebApi.Server.Documentation
{
    /// <summary>
    /// Adds support for IFormFile parameters in Swashbuckle.
    /// </summary>
    public class FormFileOperationFilter : IOperationFilter
    {
        // TODO: Support ICollection<IFormFile>

        private const string FormDataMimeType = "multipart/form-data";
        private static readonly string[] FormFilePropertyNames =
            typeof(IFormFile).GetTypeInfo().DeclaredProperties.Select(p => p.Name).ToArray();

        public void Apply(Operation operation, OperationFilterContext context)
        {
            IList<IParameter> parameters = operation.Parameters;
            if (parameters == null || parameters.Count == 0)
                return;

            var formFileParameterNames = new List<string>();

            foreach (ParameterDescriptor actionParameter in context.ApiDescription.ActionDescriptor.Parameters)
            {
                string[] properties = actionParameter.ParameterType.GetProperties()
                    .Where(p => p.PropertyType == typeof(IFormFile))
                    .Select(p => p.Name)
                    .ToArray();

                if (properties.Length != 0)
                {
                    formFileParameterNames.AddRange(properties);
                    continue;
                }

                if (actionParameter.ParameterType != typeof(IFormFile))
                    continue;
                formFileParameterNames.Add(actionParameter.Name);
            }

            if (!formFileParameterNames.Any())
                return;

            IList<string> consumes = operation.Consumes;
            consumes.Clear();
            consumes.Add(FormDataMimeType);

            for (int i = parameters.Count - 1, j = formFileParameterNames.Count - 1; i >= 0 && j >= 0; i--)
            {
                IParameter parameter = parameters[i];
                if (!(parameter is NonBodyParameter) || parameter.In != "formData")
                    continue;

                if (FormFilePropertyNames.Contains(parameter.Name))
                {
                    parameters.RemoveAt(i);
                    if (FormFilePropertyNames[0] == parameter.Name)
                    {
                        parameters.Insert(i, new NonBodyParameter()
                        {
                            Name = formFileParameterNames[j],
                            Type = "file",
                            In = "formData",
                            Description = "The file to upload.",
                            Required = true
                        });
                        j--;
                    }
                }
            }
        }
    }
}
