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

        public static Delta InsertNote(this Delta delta, int index, string style, string caller, string segRef,
            Delta noteDelta)
        {
            var deltaObj = new JObject(new JProperty("ops", new JArray(noteDelta.Ops)));
            var noteObj = new JObject(
                new JProperty("note", new JObject(
                    new JProperty("index", index),
                    new JProperty("delta", deltaObj))));

            var noteAttrs = new
            {
                note = new { caller = caller, style = style },
                segment = segRef
            };
            return delta.Insert(noteObj, noteAttrs);
        }

        public static Delta InsertChar(this Delta delta, string style, string text, string segRef = null)
        {
            var attrs = new JObject(
                new JProperty("char", new JObject(
                    new JProperty("style", style))));
            if (segRef != null)
                attrs.Add(new JProperty("segment", segRef));
            return delta.Insert(text, attrs);
        }

        public static Delta InsertChar(this Delta delta, string style, bool closed, string text, string segRef = null)
        {
            var attrs = new JObject(
                new JProperty("char", new JObject(
                    new JProperty("style", style)),
                    new JProperty("closed", closed.ToString())));
            if (segRef != null)
                attrs.Add(new JProperty("segment", segRef));
            return delta.Insert(text, attrs);
        }

        public static Delta InsertChapter(this Delta delta, string number)
        {
            return delta.Insert(new { chapter = number }, new { chapter = new { style = "c" } });
        }

        public static Delta InsertText(this Delta delta, object text, string segRef)
        {
            return delta.Insert(text, new { segment = segRef });
        }

        public static Delta InsertEmptyText(this Delta delta, string segRef)
        {
            return delta.InsertText(DeltaUsxMapper.EmptySegmentPlaceholder, segRef);
        }

        public static Delta InsertVerse(this Delta delta, string number)
        {
            return delta.Insert(new { verse = number }, new { verse = new { style = "v" } });
        }
    }
}
