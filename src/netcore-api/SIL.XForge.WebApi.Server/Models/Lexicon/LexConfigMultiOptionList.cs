namespace SIL.XForge.WebApi.Server.Models.Lexicon
{
    public class LexConfigMultiOptionList : LexConfigOptionList
    {
        public LexConfigMultiOptionList(string fieldName, bool hideIfEmpty = false)
            : base(fieldName, hideIfEmpty)
        {
            Type = MultiOptionList;
        }

        public LexConfigMultiOptionList()
        {
            Type = MultiOptionList;
        }
    }
}
