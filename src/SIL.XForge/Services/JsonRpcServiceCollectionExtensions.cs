using EdjCase.JsonRpc.Router.Abstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace SIL.XForge.Services
{
    public static class JsonRpcServiceCollectionExtensions
    {
        public static IServiceCollection AddXFJsonRpc(this IServiceCollection services)
        {
            services.AddScoped<IRpcInvoker, XForgeRpcInvoker>();
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
