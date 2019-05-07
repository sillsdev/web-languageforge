using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json.Linq;
using ShareDB.RichText;

namespace SIL.XForge.Scripture.Services
{
    public static class DeltaUsxTestExtensions
    {
        public static Delta InsertPara(this Delta delta, string style)
        {
            return delta.InsertPara(new JObject(new JProperty("style", style)));
        }

        public static Delta InsertNote(this Delta delta, Delta contents, string style, string caller, string segRef)
        {
            var obj = new JObject(
                new JProperty("style", style),
                new JProperty("caller", caller),
                new JProperty("contents", SerializeDelta(contents)));
            return delta.InsertEmbed("note", obj, segRef);
        }

        public static Delta InsertFigure(this Delta delta, string file, string size, string reference, string text,
            string segRef)
        {
            var obj = new JObject(
                new JProperty("style", "fig"),
                new JProperty("file", file),
                new JProperty("size", size),
                new JProperty("ref", reference),
                new JProperty("contents", SerializeDelta(Delta.New().Insert(text))));
            return delta.InsertEmbed("figure", obj, segRef);
        }

        public static Delta InsertChar(this Delta delta, string text, string style, string segRef = null)
        {
            var attributes = new JObject(new JProperty("char", new JObject(new JProperty("style", style))));
            return delta.InsertText(text, segRef, attributes);
        }

        public static Delta InsertChar(this Delta delta, string text, IEnumerable<string> styles, string segRef = null)
        {
            var attributes = new JObject(
                new JProperty("char", styles.Select(style => new JObject(new JProperty("style", style)))));
            return delta.InsertText(text, segRef, attributes);
        }

        public static Delta InsertCharRef(this Delta delta, string text, string style, string reference,
            string segRef = null)
        {
            var attributes = new JObject(
                new JProperty("char", new JObject(new JProperty("style", style))),
                new JProperty("ref", new JObject(new JProperty("loc", reference))));
            return delta.InsertText(text, segRef, attributes);
        }

        public static Delta InsertChapter(this Delta delta, string number)
        {
            var obj = new JObject(
                new JProperty("number", number),
                new JProperty("style", "c"));
            return delta.InsertEmbed("chapter", obj);
        }

        public static Delta InsertVerse(this Delta delta, string number)
        {
            var obj = new JObject(
                new JProperty("number", number),
                new JProperty("style", "v"));
            return delta.InsertEmbed("verse", obj);
        }

        public static Delta InsertOptBreak(this Delta delta, string segRef = null)
        {
            return delta.InsertEmbed("optbreak", new JObject(), segRef);
        }

        public static Delta InsertMilestone(this Delta delta, string style, string segRef = null)
        {
            var obj = new JObject(new JProperty("style", style));
            return delta.InsertEmbed("ms", obj, segRef);
        }

        public static Delta InsertCell(this Delta delta, int table, int row, string style, string align)
        {
            var attrs = new JObject(
                new JProperty("table", new JObject(new JProperty("id", $"table_{table}"))),
                new JProperty("row", new JObject(new JProperty("id", $"row_{table}_{row}"))),
                new JProperty("cell", new JObject(
                    new JProperty("style", style),
                    new JProperty("align", align))));
            return delta.Insert("\n", attrs);
        }

        private static JObject SerializeDelta(Delta delta)
        {
            return new JObject(new JProperty("ops", new JArray(delta.Ops)));
        }
    }
}
