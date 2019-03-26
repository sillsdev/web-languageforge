namespace SIL.XForge.Models
{
    /**
     * This should stay in sync with the corresponding enum in "Realtime/realtime-server.js".
     */
    public enum Operation
    {
        Create = 1,
        Edit,
        Delete,
        View,

        EditOwn,
        DeleteOwn,
        ViewOwn
    }
}
