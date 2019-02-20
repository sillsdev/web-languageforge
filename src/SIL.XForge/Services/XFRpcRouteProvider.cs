using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using EdjCase.JsonRpc.Router;
using EdjCase.JsonRpc.Router.Abstractions;
using EdjCase.JsonRpc.Router.MethodProviders;
using JsonApiDotNetCore.Extensions;
using SIL.XForge.Controllers;

namespace SIL.XForge.Services
{
    /// <summary>
    /// This is the routing convention for JSON-RPC controllers. The route to a JSON-RPC controller consists of a
    /// namespace prefix followed by a pluralized resource name. The resource name is generated from the controller
    /// class name by removing the "RpcController" suffix and then dasherizing the remaining string. The resource name
    /// can also be specified manually by using a <see cref="EdjCase.JsonRpc.Router.RpcRouteAttribute"/>.
    ///
    /// This class should generate routes that are consist with <see cref="XFDasherizedRoutingConvention"/>.
    /// </summary>
    public class XFRpcRouteProvider : IRpcRouteProvider
    {
        private Dictionary<RpcPath, List<IRpcMethodProvider>> _routeCache;

        public RpcPath BaseRequestPath => $"/{XForgeConstants.JsonApiNamespace}";

        public List<IRpcMethodProvider> GetMethodsByPath(RpcPath path)
        {
            Dictionary<RpcPath, List<IRpcMethodProvider>> routes = GetAllRoutes();
            foreach (KeyValuePair<RpcPath, List<IRpcMethodProvider>> kvp in routes)
            {
                if (path.StartsWith(kvp.Key))
                    return kvp.Value;
            }
            return new List<IRpcMethodProvider>();
        }

        private Dictionary<RpcPath, List<IRpcMethodProvider>> GetAllRoutes()
        {
            if (this._routeCache == null)
            {
                List<TypeInfo> controllerTypes = Assembly.GetEntryAssembly().DefinedTypes
                    .Where(t => !t.IsAbstract && t.IsSubclassOf(typeof(RpcControllerBase)))
                    .ToList();

                var controllerRoutes = new Dictionary<RpcPath, List<IRpcMethodProvider>>();
                foreach (TypeInfo controllerType in controllerTypes)
                {
                    var attribute = controllerType.GetCustomAttribute<RpcRouteAttribute>(true);
                    string routePathString;
                    if (attribute == null || attribute.RouteName == null)
                    {
                        if (controllerType.Name.EndsWith("RpcController"))
                        {
                            routePathString = controllerType.Name.Substring(0,
                                controllerType.Name.IndexOf("RpcController"));
                        }
                        else
                        {
                            routePathString = controllerType.Name;
                        }
                        routePathString = routePathString.Dasherize();
                    }
                    else
                    {
                        routePathString = attribute.RouteName;
                    }
                    RpcPath routePath = RpcPath.Parse(routePathString);
                    if (!controllerRoutes.TryGetValue(routePath, out List<IRpcMethodProvider> methodProviders))
                    {
                        methodProviders = new List<IRpcMethodProvider>();
                        controllerRoutes[routePath] = methodProviders;
                    }
                    methodProviders.Add(new ControllerPublicMethodProvider(controllerType.AsType()));
                }
                this._routeCache = controllerRoutes;
            }
            return this._routeCache;
        }
    }
}
