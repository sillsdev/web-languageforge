namespace SIL.XForge.Identity.Authentication
{
    public static class ParatextAuthenticationDefaults
    {
        public const string AuthenticationScheme = "Paratext";
        public const string DisplayName = "Paratext";
        public const string Issuer = "Paratext";
        public const string CallbackPath = "/signin-paratext";
        public const string AuthorizationEndpoint = "https://registry.paratext.org/auth";
        public const string TokenEndpoint = "https://registry.paratext.org/api8/token";
        public const string UserInformationEndpoint = "https://registry.paratext.org/api8/userinfo";
        public const string DevAuthorizationEndpoint = "https://registry-dev.paratext.org/auth";
        public const string DevTokenEndpoint = "https://registry-dev.paratext.org/api8/token";
        public const string DevUserInformationEndpoint = "https://registry-dev.paratext.org/api8/userinfo";
    }
}
