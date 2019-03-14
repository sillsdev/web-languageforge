using System.Collections.Generic;
using System.ComponentModel;
using SIL.XForge.Models;

namespace SIL.XForge.Scripture.Models
{
    public enum TextType
    {
        Target,
        Source
    }

    public class TextEntity : ProjectDataEntity
    {
        public static string GetTextDataId(string textId, int chapter, TextType textType)
        {
            string textTypeStr;
            switch (textType)
            {
                case TextType.Source:
                    textTypeStr = "source";
                    break;
                case TextType.Target:
                    textTypeStr = "target";
                    break;
                default:
                    throw new InvalidEnumArgumentException(nameof(textType), (int)textType, typeof(TextType));
            }
            return $"{textId}:{chapter}:{textTypeStr}";
        }

        public static string GetJsonDataId(string textId, int chapter)
        {
            return $"{textId}:{chapter}";
        }

        public string Name { get; set; }
        public string BookId { get; set; }
        public List<Chapter> Chapters { get; protected set; } = new List<Chapter>();
    }
}
