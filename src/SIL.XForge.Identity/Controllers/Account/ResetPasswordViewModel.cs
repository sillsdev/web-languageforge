using System.ComponentModel.DataAnnotations;

namespace SIL.XForge.Identity.Controllers.Account
{
    public class ResetPasswordViewModel
    {
        [Required]
        [MinLength(7, ErrorMessage = "{0} must be at least {1} characters ")]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [Required]
        [MinLength(7, ErrorMessage = "{0} must be at least {1} characters ")]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm Password")]
        public string ConfirmPassword { get; set; }

        public string Username { get; set; }

        public string ResetToken { get; set; }
    }
}
