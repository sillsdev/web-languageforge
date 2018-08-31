using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class SFConfigDocType
    {
        public InputSystem InputSystem { get; set; } = new InputSystem();
        public ParatextProject ParatextProject { get; set; } = new ParatextProject();
    }
}
