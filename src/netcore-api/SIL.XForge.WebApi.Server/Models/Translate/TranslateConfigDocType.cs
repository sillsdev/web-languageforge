namespace SIL.XForge.WebApi.Server.Models.Translate
{
    public class TranslateConfigDocType
    {
        public InputSystem InputSystem { get; set; } = new InputSystem();
        public ParatextProject ParatextProject { get; set; } = new ParatextProject();
    }
}
