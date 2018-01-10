using Newtonsoft.Json.Linq;
using ShareDB.RichText;
using System.Collections.Generic;
using System.Xml.Linq;

namespace SIL.XForge.WebApi.Server.Services
{
    public class DeltaUsxMapper
    {
        private static readonly HashSet<string> SupportedParaStyles = new HashSet<string>
        {
            "h", "p", "s"
        };

        public static Delta UpdateDelta(XElement usxElem, Delta oldDelta)
        {
            var newDelta = new Delta();
            int nextNoteId = 1;
            bool inVerse = false;
            foreach (XElement elem in usxElem.Elements())
            {
                switch (elem.Name.LocalName)
                {
                    case "para":
                        var style = (string)elem.Attribute("style");
                        if (!SupportedParaStyles.Contains(style))
                            continue;
                        ProcessTextElement(newDelta, elem, ref inVerse, ref nextNoteId);
                        newDelta.Insert("\n", OpAttributes("para", elem));
                        break;
                    case "chapter":
                        newDelta.Insert((string)elem.Attribute("number"));
                        newDelta.Insert("\n", OpAttributes("chapter", elem));
                        inVerse = false;
                        break;
                }
            }
            return oldDelta.Ops.Count == 0 ? newDelta : oldDelta.Diff(newDelta);
        }

        private static void ProcessTextElement(Delta newDelta, XElement elem, ref bool inVerse, ref int nextNoteId,
            JObject parentAttrs = null)
        {
            foreach (XNode node in elem.Nodes())
            {
                switch (node)
                {
                    case XElement e:
                        switch (e.Name.LocalName)
                        {
                            case "verse":
                                if (inVerse)
                                {
                                    JToken lastOp = newDelta.Ops[newDelta.Ops.Count - 1];
                                    var text = (string)lastOp[Delta.InsertType];
                                    if (text == null || text != "\n")
                                    {
                                        newDelta.Insert("\n", new JObject(
                                            new JProperty("para", new JObject(
                                                new JProperty("verse-alignment", "")
                                        ))));
                                    }
                                }
                                newDelta.Insert((string)e.Attribute("number"), OpAttributes("verse", e, parentAttrs));
                                inVerse = true;
                                break;

                            case "char":
                                newDelta.Insert(e.Value, OpAttributes("char", e, parentAttrs));
                                break;

                            case "note":
                                string noteId = $"_note_{nextNoteId}";
                                nextNoteId++;
                                JObject noteAttrs = OpAttributes("note", e, parentAttrs, noteId);
                                ProcessTextElement(newDelta, e, ref inVerse, ref nextNoteId, noteAttrs);
                                break;
                        }
                        break;

                    case XText text:
                        newDelta.Insert(text.Value);
                        break;
                }
            }
        }

        private static JObject OpAttributes(string type, XElement elem, JObject parentAttrs = null, string id = null)
        {
            var obj = new JObject();
            if (id != null)
                obj.Add(new JProperty("id", id));
            AddProperty(obj, elem, "style");
            AddProperty(obj, elem, "caller");
            AddProperty(obj, elem, "closed");
            var attrs = new JObject(new JProperty(type, obj));
            attrs.Merge(parentAttrs);
            return attrs;
        }

        private static void AddProperty(JObject obj, XElement elem, string name)
        {
            var value = (string)elem.Attribute(name);
            if (!string.IsNullOrEmpty(value))
                obj.Add(new JProperty(name, value));
        }

        public static XElement UpdateUsx(Delta delta, XElement usxElem)
        {
            // TODO: update book text from ShareDB document
            return usxElem;
        }
    }
}
