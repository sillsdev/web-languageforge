// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;

namespace SIL.XForge.Identity.Controllers.Account
{
    public class ForgotPasswordViewModel
    {
        [Required]
        public string EmailOrUsername { get; set; }
        public bool EnableErrorMessage { get; set; }
    }
}
