namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexPicture
    {
        public LexPicture(string fileName = "", string guid = null)
        {
            FileName = fileName;
            Guid = guid ?? System.Guid.NewGuid().ToString();
        }

        public string FileName { get; set; }
        public LexMultiText Caption { get; protected set; } = new LexMultiText();
        public string Guid { get; protected set; }
    }
}
