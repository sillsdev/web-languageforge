using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public class ScriptureConfigDocType
    {
        public InputSystem InputSystem { get; set; } = new InputSystem();
        public ParatextProject ParatextProject { get; set; } = new ParatextProject();
    }
}
