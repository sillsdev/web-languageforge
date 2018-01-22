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
            foreach (XElement elem in usxElem.Elements())
            {
                switch (elem.Name.LocalName)
                {
                    case "para":
                        ProcessChildNodes(newDelta, elem, ref nextNoteId);
                        newDelta.Insert("\n", OpAttributes("para", elem));
                        break;
                    case "chapter":
                        newDelta.Insert((string) elem.Attribute("number"));
                        newDelta.Insert("\n", OpAttributes("chapter", elem));
                        break;
                }
            }
            newDelta.Insert("\n");
            return newDelta;
        }

        private static void ProcessChildNodes(Delta newDelta, XElement elem, ref int nextNoteId,
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
                                newDelta.Insert((string) e.Attribute("number"), OpAttributes("verse", e, parentAttrs));
                                break;

                            case "char":
                                newDelta.Insert(e.Value, OpAttributes("char", e, parentAttrs));
                                break;

                            case "note":
                                string noteId = $"_note_{nextNoteId}";
                                nextNoteId++;
                                JObject noteAttrs = OpAttributes("note", e, parentAttrs, noteId);
                                ProcessChildNodes(newDelta, e, ref nextNoteId, noteAttrs);
                                break;
                        }
                        break;

                    case XText text:
                        newDelta.Insert(text.Value, parentAttrs?.DeepClone());
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

        public static XElement ToUsx(string usxVersion, string bookId, string desc, Delta delta)
        {
            var newUsxElem = new XElement("usx", new XAttribute("version", usxVersion),
                new XElement("book", new XAttribute("code", bookId), new XAttribute("style", "id"),
                    desc == "" ? null : desc));
            var parentStack = new Stack<(JToken Attrs, List<XNode> Nodes)>();
            foreach (JToken op in delta.Ops)
            {
                if (op.OpType() != Delta.InsertType)
                    throw new ArgumentException("The delta is not a document.", nameof(delta));

                var text = (string) op[Delta.InsertType];
                var attrs = (JObject) op[Delta.Attributes];

                if (parentStack.Count == 0)
                {
                    // start of a para or chapter block
                    parentStack.Push((null, new List<XNode>()));
                }
                if (parentStack.Peek().Attrs != null && !JToken.DeepEquals(parentStack.Peek().Attrs, attrs?["note"]))
                {
                    // end of a note
                    (JToken Attrs, List<XNode> Nodes) parent = parentStack.Pop();
                    XElement noteElem = CreateContainerElement("note", parent.Attrs, parent.Nodes);
                    parentStack.Peek().Nodes.Add(noteElem);
                }
                if (parentStack.Peek().Attrs == null && attrs?["note"] != null)
                {
                    // start of a note
                    parentStack.Push((attrs["note"], new List<XNode>()));
                }

                if (attrs == null)
                {
                    parentStack.Peek().Nodes.Add(new XText(text));
                }
                else
                {
                    foreach (JProperty prop in attrs.Properties())
                    {
                        switch (prop.Name)
                        {
                            case "para":
                                // end of a para block
                                (JToken Attrs, List<XNode> Nodes) parentPara = parentStack.Pop();
                                for (int i = 0; i < text.Length; i++)
                                    newUsxElem.Add(CreateContainerElement("para", prop.Value, parentPara.Nodes));
                                break;

                            case "chapter":
                                // end of a chapter block
                                var chapterElem = new XElement("chapter",
                                    new XAttribute("number", parentStack.Pop().Nodes.Single().ToString()));
                                AddAttributes(chapterElem, prop.Value);
                                newUsxElem.Add(chapterElem);
                                break;

                            case "verse":
                                var verseElem = new XElement("verse", new XAttribute("number", text));
                                AddAttributes(verseElem, prop.Value);
                                parentStack.Peek().Nodes.Add(verseElem);
                                break;

                            case "char":
                                XElement charElem = CreateContainerElement("char", prop.Value, text);
                                parentStack.Peek().Nodes.Add(charElem);
                                break;

                            case "note":
                                if (attrs.Count == 1)
                                    parentStack.Peek().Nodes.Add(new XText(text));
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
                if (prop.Name == "id" || prop.Name == "number")
                    continue;
                elem.Add(new XAttribute(prop.Name, (string) prop.Value));
            }
        }
    }
}
