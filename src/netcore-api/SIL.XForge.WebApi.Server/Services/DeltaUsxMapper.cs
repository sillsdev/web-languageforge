using Newtonsoft.Json.Linq;
using ShareDB.RichText;
using System.Collections.Generic;
using System.Xml.Linq;
using System;
using System.Linq;
using System.Text;

namespace SIL.XForge.WebApi.Server.Services
{
    public class DeltaUsxMapper
    {
        public static Delta ToDelta(XElement usxElem)
        {
            var newDelta = new Delta();
            int nextNoteId = 1;
            bool inVerse = false;
            foreach (XElement elem in usxElem.Elements())
            {
                switch (elem.Name.LocalName)
                {
                    case "para":
                        ProcessChildNodes(newDelta, elem, ref inVerse, ref nextNoteId);
                        newDelta.Insert("\n", OpAttributes("para", elem));
                        break;
                    case "chapter":
                        newDelta.Insert((string) elem.Attribute("number"));
                        newDelta.Insert("\n", OpAttributes("chapter", elem));
                        inVerse = false;
                        break;
                }
            }
            return newDelta;
        }

        private static void ProcessChildNodes(Delta newDelta, XElement elem, ref bool inVerse, ref int nextNoteId,
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
                                    var text = (string) lastOp[Delta.InsertType];
                                    if (text == null || text != "\n")
                                    {
                                        newDelta.Insert("\n", new JObject(
                                            new JProperty("para", new JObject(
                                                new JProperty("verse-alignment", "")))));
                                    }
                                }
                                newDelta.Insert((string) e.Attribute("number"), OpAttributes("verse", e, parentAttrs));
                                inVerse = true;
                                break;

                            case "char":
                                newDelta.Insert(e.Value, OpAttributes("char", e, parentAttrs));
                                break;

                            case "note":
                                string noteId = $"_note_{nextNoteId}";
                                nextNoteId++;
                                JObject noteAttrs = OpAttributes("note", e, parentAttrs, noteId);
                                ProcessChildNodes(newDelta, e, ref inVerse, ref nextNoteId, noteAttrs);
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
            foreach (XAttribute attribute in elem.Attributes())
                obj.Add(new JProperty(attribute.Name.LocalName, attribute.Value));
            var attrs = new JObject(new JProperty(type, obj));
            attrs.Merge(parentAttrs);
            return attrs;
        }

        public static XElement ToUsx(string bookId, string desc, Delta delta)
        {
            var newUsxElem = new XElement("usx", new XAttribute("version", "2.5"),
                new XElement("book", new XAttribute("code", bookId), new XAttribute("style", "id"), desc));
            var childNodes = new List<XNode>();
            XElement noteElem = null;
            foreach (JToken op in delta.Ops)
            {
                if (op.OpType() != Delta.InsertType)
                    throw new ArgumentException("The delta is not a document.", nameof(delta));

                var text = (string) op[Delta.InsertType];
                var attrs = (JObject) op[Delta.Attributes];

                if (attrs?["note"] == null && noteElem != null)
                    noteElem = null;

                if (attrs == null)
                {
                    childNodes.Add(new XText(text));
                }
                else
                {
                    foreach (JProperty prop in attrs.Properties())
                    {
                        switch (prop.Name)
                        {
                            case "para":
                                if (prop.Value["verse-alignment"] == null)
                                {
                                    newUsxElem.Add(CreateContainerElement("para", prop.Value, childNodes));
                                    childNodes.Clear();
                                }
                                break;

                            case "chapter":
                                var chapterElem = new XElement("chapter",
                                    new XAttribute("number", childNodes.Single().ToString()));
                                childNodes.Clear();
                                AddAttributes(chapterElem, prop.Value);
                                newUsxElem.Add(chapterElem);
                                break;

                            case "verse":
                                var verseElem = new XElement("verse", new XAttribute("number", text));
                                AddAttributes(verseElem, prop.Value);
                                childNodes.Add(verseElem);
                                break;

                            case "char":
                                XElement charElem = CreateContainerElement("char", prop.Value, text);
                                if (attrs["note"] != null)
                                {
                                    if (noteElem == null)
                                    {
                                        noteElem = CreateContainerElement("note", attrs["note"]);
                                        childNodes.Add(noteElem);
                                    }
                                    noteElem.Add(charElem);
                                }
                                else
                                {
                                    childNodes.Add(charElem);
                                }
                                break;
                        }
                    }
                }
            }
            return newUsxElem;
        }

        private static XElement CreateContainerElement(string name, JToken attributes, object content = null)
        {
            var elem = new XElement(name);
            AddAttributes(elem, attributes);
            if (content != null)
                elem.Add(content);
            return elem;
        }

        private static void AddAttributes(XElement elem, JToken attributes)
        {
            var attrsObj = (JObject) attributes;
            foreach (JProperty prop in attrsObj.Properties())
            {
                if (prop.Name == "id")
                    continue;
                elem.Add(new XAttribute(prop.Name, (string) prop.Value));
            }
        }
    }
}
