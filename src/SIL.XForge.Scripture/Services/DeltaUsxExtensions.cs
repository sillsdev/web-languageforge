using Newtonsoft.Json.Linq;
using ShareDB.RichText;

namespace SIL.XForge.Scripture.Services
{
    public static class DeltaUsxExtensions
    {
        public static Delta InsertPara(this Delta delta, string style)
        {
            return delta.InsertPara(new { style });
        }

        public static Delta InsertPara(this Delta delta, object attributes)
        {
            return delta.Insert("\n", CreateAttributes("para", attributes));
        }

        public static Delta InsertNote(this Delta delta, int index, Delta noteDelta, string style, string caller,
            string segRef)
        {
            return delta.InsertNote(index, noteDelta, new { caller, style }, segRef);
        }

        public static Delta InsertNote(this Delta delta, int index, Delta noteDelta, object attributes, string segRef)
        {
            var deltaObj = new JObject(new JProperty("ops", new JArray(noteDelta.Ops)));
            var noteObj = new JObject(
                new JProperty("note", new JObject(
                    new JProperty("index", index),
                    new JProperty("delta", deltaObj))));
            return delta.Insert(noteObj, CreateAttributes("note", attributes, segRef));
        }

        public static Delta InsertChar(this Delta delta, string text, string style, string segRef = null)
        {
            return delta.InsertChar(text, new { style }, segRef);
        }

        public static Delta InsertChar(this Delta delta, string text, object attributes, string segRef = null)
        {
            return delta.Insert(text, CreateAttributes("char", attributes, segRef));
        }

        public static Delta InsertChapter(this Delta delta, string number)
        {
            return delta.InsertChapter(number, new { style = "c" });
        }

        public static Delta InsertChapter(this Delta delta, string number, object attributes)
        {
            return delta.Insert(new { chapter = number }, CreateAttributes("chapter", attributes));
        }

        public static Delta InsertText(this Delta delta, object text, string segRef)
        {
            var attrs = new JObject();
            if (segRef != null)
                attrs.Add(new JProperty("segment", segRef));
            return delta.Insert(text, attrs);
        }

        public static Delta InsertBlank(this Delta delta, string segRef)
        {
            string type = segRef.Contains("/p") ? "initial" : "normal";

            var attrs = new JObject();
            if (segRef != null)
                attrs.Add(new JProperty("segment", segRef));

            return delta.Insert(new { blank = type }, attrs);
        }

        public static Delta InsertVerse(this Delta delta, string number)
        {
            return delta.InsertVerse(number, new { style = "v" });
        }

        public static Delta InsertVerse(this Delta delta, string number, object attributes)
        {
            return delta.Insert(new { verse = number }, CreateAttributes("verse", attributes));
        }

        private static JObject CreateAttributes(string type, object obj, string curRef = null)
        {
            var token = obj as JToken;
            if (token == null)
                token = JToken.FromObject(obj);
            var attrs = new JObject(new JProperty(type, token));
            if (curRef != null)
                attrs.Add(new JProperty("segment", curRef));
            return attrs;
        }
    }
}
