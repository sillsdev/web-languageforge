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
        public const string EmptySegmentPlaceholder = "\u200b";

        private static readonly HashSet<string> ParagraphStyles = new HashSet<string>
        {
            "p", "m", "pmo", "pm", "pmc", "pmr", "pi", "mi", "cls", "li", "pc", "pr", "ph", "lit"
        };

        public static Delta ToDelta(XElement usxElem)
        {
            var newDelta = new Delta();
            int nextNoteId = 1;
            var nextIds = new Dictionary<string, int>();
            string curRef = null;
            string curChapter = null;
            foreach (XElement elem in usxElem.Elements())
            {
                switch (elem.Name.LocalName)
                {
                    case "para":
                        var style = (string) elem.Attribute("style");
                        bool paraStyle = IsParagraphStyle(style);
                        if (paraStyle)
                        {
                            if (curRef != null)
                            {
                                int slashIndex = curRef.IndexOf("/");
                                if (slashIndex != -1)
                                    curRef = curRef.Substring(0, slashIndex);
                                curRef = GetParagraphRef(nextIds, curRef + "/" + style);
                            }
                        }
                        else
                        {
                            curRef = GetParagraphRef(nextIds, style);
                        }
                        ProcessChildNodes(newDelta, elem, curChapter, ref curRef, ref nextNoteId);
                        SegmentEnded(newDelta, curRef);
                        if (!paraStyle)
                            curRef = null;
                        newDelta.Insert("\n", OpAttributes("para", elem));
                        break;

                    case "chapter":
                        curRef = null;
                        curChapter = (string) elem.Attribute("number");
                        newDelta.Insert(new { chapter = curChapter }, OpAttributes("chapter", elem));
                        break;
                }
            }
            newDelta.Insert("\n");
            return newDelta;
        }

        private static void ProcessChildNodes(Delta newDelta, XElement elem, string curChapter, ref string curRef,
            ref int nextNoteId, JObject parentAttrs = null)
        {
            foreach (XNode node in elem.Nodes())
            {
                switch (node)
                {
                    case XElement e:
                        switch (e.Name.LocalName)
                        {
                            case "verse":
                                string verse = (string) e.Attribute("number");
                                SegmentEnded(newDelta, curRef);
                                curRef = $"verse_{curChapter}_{verse}";
                                newDelta.Insert(new { verse = verse }, OpAttributes("verse", e));
                                break;

                            case "char":
                                newDelta.Insert(e.Value, OpAttributes("char", e, curRef, parentAttrs));
                                break;

                            case "note":
                                string noteId = $"_note_{nextNoteId}";
                                nextNoteId++;
                                JObject noteAttrs = OpAttributes("note", e, curRef, id: noteId);
                                ProcessChildNodes(newDelta, e, curChapter, ref curRef, ref nextNoteId, noteAttrs);
                                break;
                        }
                        break;

                    case XText text:
                        var attrs = new JObject();
                        if (curRef != null)
                            attrs.Add(new JProperty("segment", curRef));
                        attrs.Merge(parentAttrs);
                        newDelta.Insert(text.Value, attrs);
                        break;
                }
            }
        }

        private static void SegmentEnded(Delta newDelta, string segRef)
        {
            if (segRef == null)
                return;

            if (newDelta.Ops.Count == 0)
            {
                InsertEmptySegment(newDelta, segRef);
            }
            else
            {
                JToken lastOp = newDelta.Ops[newDelta.Ops.Count - 1];
                var attrs = (JObject) lastOp[Delta.Attributes];
                if (attrs != null && (attrs["verse"] != null || attrs["chapter"] != null || attrs["para"] != null))
                    InsertEmptySegment(newDelta, segRef);
            }
        }

        private static void InsertEmptySegment(Delta newDelta, string segRef) {
            newDelta.Insert(EmptySegmentPlaceholder, new { segment = segRef });
        }

        private static bool IsParagraphStyle(string style)
        {
            if (char.IsDigit(style[style.Length - 1]))
                style = style.Substring(0, style.Length - 1);
            return ParagraphStyles.Contains(style);
        }

        private static string GetParagraphRef(Dictionary<string, int> nextIds, string prefix)
        {
            if (!nextIds.ContainsKey(prefix))
                nextIds[prefix] = 1;
            return prefix + "_" + nextIds[prefix]++;
        }

        private static JObject OpAttributes(string type, XElement elem, string curRef = null,
            JObject parentAttrs = null, string id = null)
        {
            var obj = new JObject();
            if (id != null)
                obj.Add(new JProperty("id", id));
            foreach (XAttribute attribute in elem.Attributes())
            {
                if (attribute.Name.LocalName == "number")
                    continue;
                obj.Add(new JProperty(attribute.Name.LocalName, attribute.Value));
            }
            var attrs = new JObject(new JProperty(type, obj));
            if (curRef != null)
                attrs.Add(new JProperty("segment", curRef));
            attrs.Merge(parentAttrs);
            return attrs;
        }

        public static XElement ToUsx(string usxVersion, string bookId, string desc, Delta delta)
        {
            var newUsxElem = new XElement("usx", new XAttribute("version", usxVersion),
                new XElement("book", new XAttribute("code", bookId), new XAttribute("style", "id"),
                    desc == "" ? null : desc));
            var parentStack = new Stack<(JToken Attrs, List<XNode> Nodes)>();
            for (int i = 0; i < delta.Ops.Count; i++)
            {
                JToken op = delta.Ops[i];
                if (op.OpType() != Delta.InsertType)
                    throw new ArgumentException("The delta is not a document.", nameof(delta));

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

                if (op[Delta.InsertType].Type == JTokenType.String)
                {
                    var text = (string) op[Delta.InsertType];
                    if (attrs == null)
                    {
                        if (text == EmptySegmentPlaceholder)
                            continue;
                        parentStack.Peek().Nodes.Add(new XText(text));
                    }
                    else
                    {
                        // text blots
                        foreach (JProperty prop in attrs.Properties())
                        {
                            switch (prop.Name)
                            {
                                case "para":
                                    // end of a para block
                                    (JToken Attrs, List<XNode> Nodes) parentPara = parentStack.Pop();
                                    for (int j = 0; j < text.Length; j++)
                                        newUsxElem.Add(CreateContainerElement("para", prop.Value, parentPara.Nodes));
                                    break;

                                case "char":
                                    XElement charElem = CreateContainerElement("char", prop.Value, text);
                                    parentStack.Peek().Nodes.Add(charElem);
                                    break;

                                case "segment":
                                    if (text == EmptySegmentPlaceholder)
                                        continue;
                                    if (attrs.Properties().Count(p => p.Name != "note") == 1)
                                        parentStack.Peek().Nodes.Add(new XText(text));
                                    break;

                                case "note":
                                    if (text == EmptySegmentPlaceholder)
                                        continue;
                                    if (attrs.Count == 1)
                                        parentStack.Peek().Nodes.Add(new XText(text));
                                    break;
                            }
                        }
                    }
                }
                else
                {
                    // embeds
                    var obj = (JObject) op[Delta.InsertType];
                    foreach (JProperty prop in obj.Properties())
                    {
                        switch (prop.Name)
                        {
                            case "chapter":
                                var chapterNum = (string) prop.Value;
                                var chapterElem = new XElement("chapter", new XAttribute("number", chapterNum));
                                AddAttributes(chapterElem, attrs["chapter"]);
                                newUsxElem.Add(chapterElem);
                                break;

                            case "verse":
                                var verseNum = (string) prop.Value;
                                var verseElem = new XElement("verse", new XAttribute("number", verseNum));
                                AddAttributes(verseElem, attrs["verse"]);
                                parentStack.Peek().Nodes.Add(verseElem);
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
