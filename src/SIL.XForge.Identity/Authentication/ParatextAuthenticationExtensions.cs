using System;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;

namespace SIL.XForge.Identity.Authentication
{
    public static class ParatextAuthenticationExtensions
    {
        public static AuthenticationBuilder AddParatext(this AuthenticationBuilder builder)
        {
            return builder.AddParatext(options => { });
        }

        public static AuthenticationBuilder AddParatext(this AuthenticationBuilder builder,
            Action<ParatextAuthenticationOptions> configuration)
        {
            return builder.AddParatext(ParatextAuthenticationDefaults.AuthenticationScheme, configuration);
        }

        public static AuthenticationBuilder AddParatext(this AuthenticationBuilder builder, string scheme,
            Action<ParatextAuthenticationOptions> configuration)
        {
            return builder.AddParatext(scheme, ParatextAuthenticationDefaults.DisplayName, configuration);
        }

        public static AuthenticationBuilder AddParatext(this AuthenticationBuilder builder, string scheme,
            string displayName, Action<ParatextAuthenticationOptions> configuration)
        {
            return builder.AddOAuth<ParatextAuthenticationOptions, ParatextAuthenticationHandler>(scheme, displayName,
                configuration);
        }
    }
}
