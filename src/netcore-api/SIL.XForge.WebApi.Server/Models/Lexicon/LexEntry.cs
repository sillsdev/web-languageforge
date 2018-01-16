using System.Collections.Generic;

namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexEntry : IEntity
    {
        public string Id { get; set; }

        public MultiText Lexeme { get; set; }

        public IList<LexSense> Senses { get; set; } = new List<LexSense>();


    }

}
