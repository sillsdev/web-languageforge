using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexSense
    {
        MultiText Definition { get; set; } = new MultiText();
        MultiText Gloss { get; set; } = new MultiText();

        IList<LexPicture> Pictures { get; set; }
    }
}
