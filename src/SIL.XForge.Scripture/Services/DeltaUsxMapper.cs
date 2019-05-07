using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Xml.Linq;
using Newtonsoft.Json.Linq;
using ShareDB.RichText;

namespace SIL.XForge.Scripture.Services
{
    public class DeltaUsxMapper
    {
        private static readonly HashSet<string> ParagraphStyles = new HashSet<string>
        {
            "p", "m", "pmo", "pm", "pmc", "pmr", "pi", "mi", "cls", "li", "pc", "pr", "ph", "lit", "q", "qc", "qr",
            "qa", "qm", "b"
        };

        public IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> ToChapterDeltas(XElement usxElem)
        {
            var chapterDeltas = new SortedList<int, (Delta Delta, int LastVerse)>();
            var chapterDelta = new Delta();
            string lastVerse = null;
            var nextIds = new Dictionary<string, int>();
            string curRef = null;
            int curChapter = 0;
            int tableIndex = 0;
            bool topLevelVerses = false;
            foreach (XNode node in usxElem.Nodes())
            {
                switch (node)
                {
                    case XElement elem:
                        switch (elem.Name.LocalName)
                        {
                            case "book":
                                break;

                            case "para":
                                if (topLevelVerses)
                                {
                                    // add implicit paragraph when there are top-level verses
                                    chapterDelta.Insert('\n');
                                    topLevelVerses = false;
                                }
                                var style = (string)elem.Attribute("style");
                                bool paraStyle = IsParagraphStyle(style);
                                if (paraStyle)
                                {
                                    if (curRef != null)
                                    {
                                        int slashIndex = curRef.IndexOf("/", StringComparison.Ordinal);
                                        if (slashIndex != -1)
                                            curRef = curRef.Substring(0, slashIndex);
                                        curRef = GetParagraphRef(nextIds, curRef, curRef + "/" + style);
                                    }
                                }
                                else
                                {
                                    curRef = GetParagraphRef(nextIds, style, style);
                                }
                                ProcessChildNodes(chapterDelta, elem, curChapter, ref lastVerse, ref curRef,
                                    ref tableIndex);
                                SegmentEnded(chapterDelta, curRef);
                                if (!paraStyle)
                                    curRef = null;
                                chapterDelta.InsertPara(GetAttributes(elem));
                                break;

                            case "chapter":
                                if (curChapter != 0)
                                {
                                    ChapterEnded(chapterDeltas, chapterDelta, curChapter, lastVerse, curRef,
                                        topLevelVerses);
                                    chapterDelta = new Delta();
                                }
                                curRef = null;
                                lastVerse = null;
                                curChapter = (int)elem.Attribute("number");
                                chapterDelta.InsertEmbed("chapter", GetAttributes(elem));
                                break;

                            // according to the USX schema, a verse can only occur within a paragraph, but Paratext 8.0
                            // can still generate USX with verses at the top-level
                            case "verse":
                                ProcessChildNode(chapterDelta, elem, curChapter, ref lastVerse, ref curRef,
                                    ref tableIndex);
                                topLevelVerses = true;
                                break;

                            default:
                                ProcessChildNode(chapterDelta, elem, curChapter, ref lastVerse, ref curRef,
                                    ref tableIndex);
                                break;
                        }
                        break;

                    case XText text:
                        chapterDelta.InsertText(text.Value, curRef);
                        break;
                }
            }
            ChapterEnded(chapterDeltas, chapterDelta, curChapter, lastVerse, curRef, topLevelVerses);
            return chapterDeltas;
        }

        private void ProcessChildNodes(Delta newDelta, XElement parentElem)
        {
            string tempRef = null;
            string tempLastVerse = null;
            int tempTableIndex = 0;
            ProcessChildNodes(newDelta, parentElem, 0, ref tempLastVerse, ref tempRef, ref tempTableIndex);
        }

        private void ProcessChildNodes(Delta newDelta, XElement parentElem, int curChapter, ref string lastVerse,
            ref string curRef, ref int tableIndex, JObject attributes = null)
        {
            foreach (XNode node in parentElem.Nodes())
                ProcessChildNode(newDelta, node, curChapter, ref lastVerse, ref curRef, ref tableIndex, attributes);
        }

        private void ProcessChildNode(Delta newDelta, XNode node, int curChapter, ref string lastVerse,
            ref string curRef, ref int tableIndex, JObject attributes = null)
        {
            switch (node)
            {
                case XElement elem:
                    switch (elem.Name.LocalName)
                    {
                        case "para":
                            ProcessChildNodes(newDelta, elem);
                            newDelta.InsertPara(GetAttributes(elem));
                            break;

                        case "verse":
                            lastVerse = (string)elem.Attribute("number");
                            InsertVerse(newDelta, elem, curChapter, ref curRef);
                            break;

                        case "ref":
                            var newRefAttributes = (JObject)attributes?.DeepClone() ?? new JObject();
                            newRefAttributes.Add(new JProperty(elem.Name.LocalName, GetAttributes(elem)));
                            newDelta.InsertText(elem.Value, curRef, newRefAttributes);
                            break;

                        case "char":
                            var newChildAttributes = (JObject)attributes?.DeepClone() ?? new JObject();
                            JToken existingCharAttrs = newChildAttributes["char"];
                            JObject newCharAttrs = GetAttributes(elem);
                            if (existingCharAttrs == null)
                            {
                                newChildAttributes.Add(new JProperty(elem.Name.LocalName, newCharAttrs));
                            }
                            else
                            {
                                switch (existingCharAttrs)
                                {
                                    case JArray array:
                                        array.Add(newCharAttrs);
                                        break;
                                    case JObject obj:
                                        newChildAttributes[elem.Name.LocalName] = new JArray(obj, newCharAttrs);
                                        break;

                                }
                            }
                            ProcessChildNodes(newDelta, elem, curChapter, ref lastVerse, ref curRef, ref tableIndex,
                                newChildAttributes);
                            break;

                        case "table":
                            tableIndex++;
                            JObject tableAttributes = GetAttributes(elem);
                            tableAttributes.Add(new JProperty("id", $"table_{tableIndex}"));
                            int rowIndex = 1;
                            foreach (XElement row in elem.Elements("row"))
                            {
                                var rowAttributes = new JObject(new JProperty("id", $"row_{tableIndex}_{rowIndex}"));
                                foreach (XElement cell in row.Elements())
                                {
                                    ProcessChildNode(newDelta, cell, curChapter, ref lastVerse, ref curRef,
                                        ref tableIndex);
                                    var attrs = new JObject(
                                        new JProperty("table", tableAttributes),
                                        new JProperty("row", rowAttributes));
                                    if (cell.Name.LocalName == "cell")
                                        attrs.Add(new JProperty("cell", GetAttributes(cell)));
                                    newDelta.Insert("\n", attrs);
                                }
                                rowIndex++;
                            }
                            break;

                        case "cell":
                            ProcessChildNodes(newDelta, elem, curChapter, ref lastVerse, ref curRef, ref tableIndex);
                            break;

                        default:
                            InsertEmbed(newDelta, elem, curRef, attributes);
                            break;
                    }
                    break;

                case XText text:
                    newDelta.InsertText(text.Value, curRef, attributes);
                    break;
            }
        }

        private void ChapterEnded(SortedList<int, (Delta Delta, int LastVerse)> chapterDeltas, Delta chapterDelta,
            int curChapter, string lastVerse, string curRef, bool topLevelVerses)
        {
            if (topLevelVerses)
            {
                // add implicit paragraph when there are top-level verses
                SegmentEnded(chapterDelta, curRef);
                chapterDelta.Insert('\n');
                topLevelVerses = false;
            }
            int lastVerseNum = 0;
            if (lastVerse != null)
            {
                int dashIndex = lastVerse.IndexOf('-');
                if (dashIndex != -1)
                    lastVerseNum = int.Parse(lastVerse.Substring(dashIndex + 1), CultureInfo.InvariantCulture);
                else
                    lastVerseNum = int.Parse(lastVerse, CultureInfo.InvariantCulture);
            }
            chapterDeltas[curChapter] = (chapterDelta, lastVerseNum);
        }

        private static void InsertVerse(Delta newDelta, XElement elem, int curChapter, ref string curRef)
        {
            var verse = (string)elem.Attribute("number");
            SegmentEnded(newDelta, curRef);
            curRef = $"verse_{curChapter}_{verse}";
            newDelta.InsertEmbed("verse", GetAttributes(elem));
        }

        private void InsertEmbed(Delta newDelta, XElement elem, string curRef, JObject attributes)
        {
            JObject obj = GetAttributes(elem);
            var contents = new Delta();
            ProcessChildNodes(contents, elem);
            if (contents.Ops.Count > 0)
            {
                obj.Add(new JProperty("contents",
                    new JObject(new JProperty("ops", new JArray(contents.Ops)))));
            }
            newDelta.InsertEmbed(elem.Name.LocalName, obj, curRef, attributes);
        }

        private static void SegmentEnded(Delta newDelta, string segRef)
        {
            if (segRef == null)
                return;

            if (newDelta.Ops.Count == 0)
            {
                newDelta.InsertBlank(segRef);
            }
            else
            {
                JToken lastOp = newDelta.Ops[newDelta.Ops.Count - 1];
                var embed = lastOp[Delta.InsertType] as JObject;
                var attrs = (JObject)lastOp[Delta.Attributes];
                if ((embed != null && (embed["verse"] != null || embed["chapter"] != null))
                    || (attrs != null && attrs["para"] != null))
                {
                    newDelta.InsertBlank(segRef);
                }
            }
        }

        private static bool IsParagraphStyle(string style)
        {
            if (char.IsDigit(style[style.Length - 1]))
                style = style.Substring(0, style.Length - 1);
            return ParagraphStyles.Contains(style);
        }

        private static string GetParagraphRef(Dictionary<string, int> nextIds, string key, string prefix)
        {
            if (!nextIds.ContainsKey(key))
                nextIds[key] = 1;
            return prefix + "_" + nextIds[key]++;
        }

        private static JObject GetAttributes(XElement elem)
        {
            var obj = new JObject();
            foreach (XAttribute attribute in elem.Attributes())
                obj.Add(new JProperty(attribute.Name.LocalName, attribute.Value));
            return obj;
        }

        public XElement ToUsx(string usxVersion, string bookId, string desc, IEnumerable<Delta> chapterDeltas)
        {
            var newUsxElem = new XElement("usx", new XAttribute("version", usxVersion),
                new XElement("book", new XAttribute("code", bookId), new XAttribute("style", "id"),
                    desc == "" ? null : desc));
            foreach (Delta chapterDelta in chapterDeltas)
                ProcessDelta(newUsxElem, chapterDelta);
            return newUsxElem;
        }

        private void ProcessDelta(XElement rootElem, Delta delta)
        {
            var curCharAttrs = new List<JObject>();
            var childNodes = new Stack<List<XNode>>();
            childNodes.Push(new List<XNode>());
            JObject curTableAttrs = null;
            JObject curRowAttrs = null;
            foreach (JToken op in delta.Ops)
            {
                if (op.OpType() != Delta.InsertType)
                    throw new ArgumentException("The delta is not a document.", nameof(delta));

                var attrs = (JObject)op[Delta.Attributes];
                if (curCharAttrs.Count > 0 && (attrs == null || attrs["char"] == null))
                {
                    while (curCharAttrs.Count > 0)
                        CharEnded(childNodes, curCharAttrs);
                }
                else if (attrs != null && attrs["char"] != null)
                {
                    List<JObject> charAttrs = GetCharAttributes(attrs["char"]);
                    while (curCharAttrs.Count > 0 && !CharAttributesMatch(curCharAttrs, charAttrs))
                        CharEnded(childNodes, curCharAttrs);
                    curCharAttrs = charAttrs;
                    while (childNodes.Count < curCharAttrs.Count + 1)
                        childNodes.Push(new List<XNode>());
                }

                if (op[Delta.InsertType].Type == JTokenType.String)
                {
                    var text = (string)op[Delta.InsertType];
                    if (curTableAttrs != null && (attrs == null || attrs["table"] == null) && text == "\n")
                    {
                        List<XNode> nextBlockNodes = RowEnded(childNodes, ref curRowAttrs);
                        TableEnded(rootElem, childNodes, ref curTableAttrs);
                        childNodes.Peek().AddRange(nextBlockNodes);
                    }
                    else if (attrs != null && attrs["table"] != null)
                    {
                        var cellAttrs = (JObject)attrs["cell"];
                        XElement cellElem;
                        if (cellAttrs != null)
                            cellElem = CreateContainerElement("cell", cellAttrs, childNodes.Peek());
                        else
                            cellElem = (XElement)childNodes.Peek().Single();
                        childNodes.Pop();

                        var tableAttrs = (JObject)attrs["table"];
                        var rowAttrs = (JObject)attrs["row"];
                        if (curTableAttrs != null)
                        {
                            if ((string)rowAttrs["id"] != (string)curRowAttrs["id"])
                                RowEnded(childNodes, ref curRowAttrs);
                            if ((string)tableAttrs["id"] != (string)curTableAttrs["id"])
                                TableEnded(rootElem, childNodes, ref curTableAttrs);
                        }

                        while (childNodes.Count < 2)
                            childNodes.Push(new List<XNode>());
                        childNodes.Peek().Add(cellElem);
                        childNodes.Push(new List<XNode>());

                        curTableAttrs = tableAttrs;
                        curRowAttrs = rowAttrs;
                    }

                    if (attrs == null)
                    {
                        if (text == "\n")
                        {
                            rootElem.Add(childNodes.Peek());
                            childNodes.Peek().Clear();
                            continue;
                        }
                        childNodes.Peek().Add(new XText(text));
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
                                    for (int j = 0; j < text.Length; j++)
                                        rootElem.Add(CreateContainerElement("para", prop.Value, childNodes.Peek()));
                                    childNodes.Peek().Clear();
                                    break;

                                case "ref":
                                    XElement refElem = CreateContainerElement("ref", prop.Value, text);
                                    childNodes.Peek().Add(refElem);
                                    break;

                                case "char":
                                    if (attrs["ref"] == null)
                                        childNodes.Peek().Add(new XText(text));
                                    break;

                                case "segment":
                                    if (attrs.Count == 1)
                                        childNodes.Peek().Add(new XText(text));
                                    break;
                            }
                        }
                    }
                }
                else
                {
                    // embeds
                    var obj = (JObject)op[Delta.InsertType];
                    foreach (JProperty prop in obj.Properties())
                    {
                        switch (prop.Name)
                        {
                            case "chapter":
                                XElement chapterElem = new XElement("chapter");
                                AddAttributes(chapterElem, prop.Value);
                                rootElem.Add(chapterElem);
                                break;

                            case "blank":
                                // ignore blank embeds
                                break;

                            default:
                                XElement embedElem = new XElement(prop.Name);
                                AddAttributes(embedElem, prop.Value);
                                if (prop.Value["contents"] != null)
                                {
                                    var contentsDelta = new Delta(prop.Value["contents"]["ops"].Children());
                                    ProcessDelta(embedElem, contentsDelta);
                                }
                                childNodes.Peek().Add(embedElem);
                                break;
                        }
                    }


                }
            }
            if (curTableAttrs != null)
            {
                RowEnded(childNodes, ref curRowAttrs);
                TableEnded(rootElem, childNodes, ref curTableAttrs);
            }
            rootElem.Add(childNodes.Pop());
        }

        private static bool CharAttributesMatch(List<JObject> curCharAttrs, List<JObject> charAttrs)
        {
            if (curCharAttrs.Count > charAttrs.Count)
                return false;

            for (int i = 0; i < curCharAttrs.Count; i++)
            {
                if (!JToken.DeepEquals(curCharAttrs[i], charAttrs[i]))
                    return false;
            }
            return true;
        }

        private static List<JObject> GetCharAttributes(JToken charAttrs)
        {
            switch (charAttrs)
            {
                case JArray array:
                    return new List<JObject>(array.Children<JObject>());

                case JObject obj:
                    return new List<JObject> { obj };
            }
            return new List<JObject>();
        }

        private static JObject RemoveCharAttributes(ref JToken curChar)
        {
            JObject charAttrs = null;
            switch (curChar)
            {
                case JArray array:
                    charAttrs = (JObject)array.Last;
                    array.Remove(charAttrs);
                    if (array.Count == 1)
                        curChar = array.First;
                    break;

                case JObject obj:
                    charAttrs = obj;
                    curChar = null;
                    break;
            }
            return charAttrs;
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
            var attrsObj = (JObject)attributes;
            foreach (JProperty prop in attrsObj.Properties())
            {
                if (prop.Value.Type != JTokenType.String || prop.Name == "id")
                    continue;
                elem.Add(new XAttribute(prop.Name, (string)prop.Value));
            }
        }

        private static void CharEnded(Stack<List<XNode>> childNodes, List<JObject> curCharAttrs)
        {
            JObject charAttrs = curCharAttrs[curCharAttrs.Count - 1];
            curCharAttrs.RemoveAt(curCharAttrs.Count - 1);
            XElement charElem = CreateContainerElement("char", charAttrs, childNodes.Peek());
            childNodes.Pop();
            childNodes.Peek().Add(charElem);
        }

        private static List<XNode> RowEnded(Stack<List<XNode>> childNodes, ref JObject curRowAttrs)
        {
            if (childNodes.Count > 3)
                throw new InvalidOperationException("A table is not valid in the current location.");

            List<XNode> nextBlockNodes = null;
            if (childNodes.Count == 3)
                nextBlockNodes = childNodes.Pop();
            XElement rowElem = CreateContainerElement("row", new JObject(), childNodes.Peek());
            childNodes.Pop();
            childNodes.Peek().Add(rowElem);
            curRowAttrs = null;
            return nextBlockNodes;
        }

        private static void TableEnded(XElement rootElem, Stack<List<XNode>> childNodes, ref JObject curTableAttrs)
        {
            rootElem.Add(CreateContainerElement("table", curTableAttrs, childNodes.Peek()));
            childNodes.Peek().Clear();
            curTableAttrs = null;
        }
    }
}
