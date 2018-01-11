using System;
using Newtonsoft.Json.Linq;
using ShareDB.RichText;

namespace SIL.XForge.WebApi.Server.Services
{
    public static class DeltaUsxExtensions
    {
        public static Delta InsertPara(this Delta delta, string style)
        {
            return delta.Insert("\n", new { para = new { style = style } });
        }

        public static Delta InsertVerseAlignmentPara(this Delta delta)
        {
            return delta.Insert("\n", new JObject(
                new JProperty("para", new JObject(
                    new JProperty("verse-alignment", "")))));
        }

        public static Delta InsertNote(this Delta delta, string id, string style, string caller, Delta noteDelta)
        {
            var noteAttrs = new { note = new { id = id, caller = caller, style = style } };

            foreach (JToken op in noteDelta.Ops)
            {
                if (op.OpType() != Delta.InsertType)
                    throw new ArgumentException("The note delta is not a document.", nameof(noteDelta));

                var attrs = (JObject) op[Delta.Attributes].DeepClone();
                attrs.Merge(JToken.FromObject(noteAttrs));
                delta.Insert(op[Delta.InsertType], attrs);
            }
            return delta;
        }

        public static Delta InsertChar(this Delta delta, string style, string text)
        {
            return delta.Insert(text, new JObject(
                new JProperty("char", new JObject(
                    new JProperty("style", style)))));
        }

        public static Delta InsertChar(this Delta delta, string style, bool closed, string text)
        {
            return delta.Insert(text, new JObject(
                new JProperty("char", new JObject(
                    new JProperty("style", style)),
                    new JProperty("closed", closed.ToString()))));
        }

        public static Delta InsertChapter(this Delta delta, string number)
        {
            return delta
                .Insert(number)
                .Insert("\n", new { chapter = new { style = "c" } });
        }

        public static Delta InsertVerse(this Delta delta, string number)
        {
            return delta.Insert(number, new { verse = new { style = "v" } });
        }
    }
}
