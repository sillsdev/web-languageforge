using System.Reflection;
using JsonApiDotNetCore.Controllers;
using JsonApiDotNetCore.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;

namespace SIL.XForge.Services
{
    /// <summary>
    /// This is the routing convention that is used for JSON-API controllers. The route to a JSON-API controller
    /// consists of a namespace prefix followed by a pluralized resource name. The resource name is generated from the
    /// controller class name by removing the "Controller" suffix and then dasherizing the remaining string. The
    /// resource name can also be specified manually by using a <see cref="Microsoft.AspNetCore.Mvc.RouteAttribute"/>.
    ///
    /// This class should generate routes that are consist with <see cref="XForgeRpcRouteProvider"/>.
    /// </summary>
    public class XForgeDasherizedRoutingConvention : IApplicationModelConvention
    {
        private readonly string _namespace;

        public XForgeDasherizedRoutingConvention(string nspace)
        {
            _namespace = nspace;
        }

        public void Apply(ApplicationModel application)
        {
            foreach (ControllerModel controller in application.Controllers)
            {
                if (IsDasherizedJsonApiController(controller) == false)
                    continue;

                string route;
                RouteAttribute routeAttr = controller.ControllerType.GetCustomAttribute<RouteAttribute>(true);
                if (routeAttr != null)
                    route = routeAttr.Template;
                else
                    route = controller.ControllerName.Dasherize();
                controller.Selectors[0].AttributeRouteModel = new AttributeRouteModel
                {
                    Template = $"{_namespace}/{route}"
                };
            }
        }

        private bool IsDasherizedJsonApiController(ControllerModel controller)
        {
            TypeInfo type = controller.ControllerType;
            bool notDisabled = type.GetCustomAttribute<DisableRoutingConventionAttribute>() == null;
            return notDisabled && type.IsSubclassOf(typeof(JsonApiControllerMixin));
        }
    }
}
