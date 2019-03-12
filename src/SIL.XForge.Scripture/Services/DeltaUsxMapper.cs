using System;
using System.Collections.Generic;
using System.Globalization;
using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;
using ShareDB.RichText;

namespace SIL.XForge.Scripture.Services
{
    public class DeltaUsxMapper
    {
        private static readonly HashSet<string> ParagraphStyles = new HashSet<string>
        {
            "p", "m", "pmo", "pm", "pmc", "pmr", "pi", "mi", "cls", "li", "pc", "pr", "ph", "lit"
        };

        private readonly ILogger<DeltaUsxMapper> _logger;

        public DeltaUsxMapper(ILogger<DeltaUsxMapper> logger)
        {
            _logger = logger;
        }

        public IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> ToChapterDeltas(string projectId,
            XElement usxElem)
        {
            var chapterDeltas = new SortedList<int, (Delta Delta, int LastVerse)>();
            var chapterDelta = new Delta();
            string lastVerse = null;
            int nextNoteId = 0;
            var nextIds = new Dictionary<string, int>();
            string curRef = null;
            string curChapter = null;
            string bookId = null;
            bool topLevelVerses = false;
            foreach (XNode node in usxElem.Nodes())
            {
                switch (node)
                {
                    case XElement elem:
                        switch (elem.Name.LocalName)
                        {
                            case "book":
                                bookId = (string)elem.Attribute("code");
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
                                ProcessChildNodes(projectId, bookId, chapterDelta, elem, curChapter, ref lastVerse,
                                    ref curRef, ref nextNoteId);
                                SegmentEnded(chapterDelta, curRef);
                                if (!paraStyle)
                                    curRef = null;
                                chapterDelta.InsertPara(GetAttributes(elem));
                                break;

                            case "chapter":
                                if (curChapter != null)
                                {
                                    ChapterEnded(chapterDeltas, chapterDelta, curChapter, lastVerse, curRef,
                                        topLevelVerses);
                                    chapterDelta = new Delta();
                                }
                                curRef = null;
                                lastVerse = null;
                                curChapter = (string)elem.Attribute("number");
                                chapterDelta.InsertChapter(curChapter, GetAttributes(elem));
                                break;

                            // according to the USX schema, a verse can only occur within a paragraph, but Paratext 8.0
                            // can still generate USX with verses at the top-level
                            case "verse":
                                lastVerse = (string)elem.Attribute("number");
                                InsertVerse(chapterDelta, elem, curChapter, ref curRef);
                                topLevelVerses = true;
                                break;

                            default:
                                LogUnknownElement(projectId, bookId, elem);
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

        private void ChapterEnded(SortedList<int, (Delta Delta, int LastVerse)> chapterDeltas, Delta chapterDelta,
            string curChapter, string lastVerse, string curRef, bool topLevelVerses)
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
            chapterDeltas[int.Parse(curChapter, CultureInfo.InvariantCulture)] = (chapterDelta, lastVerseNum);
        }

        private void ProcessChildNodes(string projectId, string bookId, Delta newDelta, XElement parentElem,
            string curChapter, ref string lastVerse, ref string curRef, ref int nextNoteId)
        {
            foreach (XNode node in parentElem.Nodes())
            {
                switch (node)
                {
                    case XElement elem:
                        switch (elem.Name.LocalName)
                        {
                            case "verse":
                                lastVerse = (string)elem.Attribute("number");
                                InsertVerse(newDelta, elem, curChapter, ref curRef);
                                break;

                            case "char":
                                newDelta.InsertChar(elem.Value, GetAttributes(elem), curRef);
                                break;

                            case "note":
                                var noteDelta = new Delta();
                                string tempRef = null;
                                ProcessChildNodes(projectId, bookId, noteDelta, elem, curChapter, ref lastVerse,
                                    ref tempRef, ref nextNoteId);
                                newDelta.InsertNote(nextNoteId, noteDelta, GetAttributes(elem), curRef);
                                nextNoteId++;
                                break;

                            default:
                                LogUnknownElement(projectId, bookId, elem);
                                break;
                        }
                        break;

                    case XText text:
                        newDelta.InsertText(text.Value, curRef);
                        break;
                }
            }
        }

        private void LogUnknownElement(string projectId, string bookId, XElement elem)
        {
            _logger.LogWarning(
                "Encountered unknown USX element '{Element}' in book '{Book}' of project '{Project}'",
                elem.Name.LocalName, bookId, projectId);
        }

        private static void InsertVerse(Delta newDelta, XElement elem, string curChapter, ref string curRef)
        {
            var verse = (string)elem.Attribute("number");
            SegmentEnded(newDelta, curRef);
            curRef = $"verse_{curChapter}_{verse}";
            newDelta.InsertVerse(verse, GetAttributes(elem));
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
                var attrs = (JObject)lastOp[Delta.Attributes];
                if (attrs != null && (attrs["verse"] != null || attrs["chapter"] != null || attrs["para"] != null))
                    newDelta.InsertBlank(segRef);
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
            {
                if (attribute.Name.LocalName == "number")
                    continue;
                obj.Add(new JProperty(attribute.Name.LocalName, attribute.Value));
            }
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
            var childNodes = new List<XNode>();
            foreach (JToken op in delta.Ops)
            {
                if (op.OpType() != Delta.InsertType)
                    throw new ArgumentException("The delta is not a document.", nameof(delta));

                var attrs = (JObject)op[Delta.Attributes];

                if (op[Delta.InsertType].Type == JTokenType.String)
                {
                    var text = (string)op[Delta.InsertType];
                    if (attrs == null)
                    {
                        if (text == "\n")
                        {
                            rootElem.Add(childNodes);
                            childNodes.Clear();
                            continue;
                        }
                        childNodes.Add(new XText(text));
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
                                        rootElem.Add(CreateContainerElement("para", prop.Value, childNodes));
                                    childNodes.Clear();
                                    break;

                                case "char":
                                    XElement charElem = CreateContainerElement("char", prop.Value, text);
                                    childNodes.Add(charElem);
                                    break;

                                case "segment":
                                    if (attrs.Count == 1)
                                        childNodes.Add(new XText(text));
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
                                var chapterNum = (string)prop.Value;
                                var chapterElem = new XElement("chapter", new XAttribute("number", chapterNum));
                                AddAttributes(chapterElem, attrs["chapter"]);
                                rootElem.Add(chapterElem);
                                break;

                            case "verse":
                                var verseNum = (string)prop.Value;
                                var verseElem = new XElement("verse", new XAttribute("number", verseNum));
                                AddAttributes(verseElem, attrs["verse"]);
                                childNodes.Add(verseElem);
                                break;

                            case "blank":
                                // ignore blank embeds
                                break;

                            case "note":
                                XElement noteElem = new XElement("note");
                                AddAttributes(noteElem, attrs["note"]);
                                var noteDelta = new Delta(prop.Value["delta"]["ops"].Children());
                                ProcessDelta(noteElem, noteDelta);
                                childNodes.Add(noteElem);
                                break;
                        }
                    }
                }
            }

            rootElem.Add(childNodes);
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
                if (prop.Name == "id" || prop.Name == "number")
                    continue;
                elem.Add(new XAttribute(prop.Name, (string)prop.Value));
            }
        }
    }
}
