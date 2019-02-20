using EdjCase.JsonRpc.Router.Abstractions;
using Microsoft.AspNetCore.Builder;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using SIL.XForge.Services;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class JsonRpcServiceCollectionExtensions
    {
        public static IServiceCollection AddXFJsonRpc(this IServiceCollection services)
        {
            services.AddScoped<IRpcInvoker, XFRpcInvoker>();
            services.AddJsonRpc().WithOptions(options =>
                {
                    options.JsonSerializerSettings = new JsonSerializerSettings
                    {
                        ContractResolver = new CamelCasePropertyNamesContractResolver(),
                        NullValueHandling = NullValueHandling.Ignore
                    };
                });
            return services;
        }
    }
}
