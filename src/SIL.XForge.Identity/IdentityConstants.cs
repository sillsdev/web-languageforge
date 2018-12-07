using System;

namespace SIL.XForge.Identity
{
    public static class IdentityConstants
    {
        public static readonly TimeSpan RememberMeLogInDuration = TimeSpan.FromDays(30);
        public const int PasswordResetPeriodDays = 7;
        public const int EmailVerificationPeriodDays = 7;
    }
}
