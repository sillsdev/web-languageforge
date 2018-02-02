using System.Xml.Linq;
using NUnit.Framework;
using ShareDB.RichText;

namespace SIL.XForge.WebApi.Server.Services
{
    [TestFixture]
    public class DeltaUsxMapperTests
    {
        [Test]
        public void ToUsx_HeaderPara()
        {
            var delta = Delta.New()
                .InsertText("Philemon", "h_1")
                .InsertPara("h")
                .Insert("\n");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Para("h", "Philemon"));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_VerseText()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("Verse text.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "Verse text."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_EmptySegments()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertEmptyText("verse_1_1")
                .InsertVerse("2")
                .InsertEmptyText("verse_1_2")
                .InsertPara("p")
                .InsertEmptyText("verse_1_2/li_1")
                .InsertPara("li")
                .InsertEmptyText("verse_1_2/li_2")
                .InsertPara("li")
                .InsertEmptyText("verse_1_2/p_1")
                .InsertVerse("3")
                .InsertEmptyText("verse_1_3")
                .InsertPara("p")
                .Insert("\n");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    Verse("2")),
                Para("li"),
                Para("li"),
                Para("p",
                    Verse("3")));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_CharText()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is some ", "verse_1_1")
                .InsertChar("bd", "bold", "verse_1_1")
                .InsertText(" text.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is some ",
                    Char("bd", "bold"),
                    " text."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_Note()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a footnote", "verse_1_1")
                .InsertNote(0, "f", "+", "verse_1_1", Delta.New()
                    .InsertChar("fr", "1.1: ")
                    .InsertChar("ft", "Refers to ")
                    .InsertChar("fq", "a footnote")
                    .Insert(". ")
                    .InsertChar("xt", "John 1:1")
                    .Insert(" and ")
                    .InsertChar("xt", "Mark 1:1")
                    .Insert("."))
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a footnote",
                    Note("f", "+",
                        Char("fr", "1.1: "),
                        Char("ft", "Refers to "),
                        Char("fq", "a footnote"),
                        ". ",
                        Char("xt", "John 1:1"),
                        " and ",
                        Char("xt", "Mark 1:1"),
                        "."),
                    ", so that we can test it."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_ConsecutiveSameStyleEmptyParas()
        {
            var delta = Delta.New()
                .InsertPara("p")
                .InsertPara("p")
                .Insert("\n");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Para("p"),
                Para("p"));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToDelta_EmptySegments()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    Verse("2")),
                Para("li"),
                Para("li"),
                Para("p",
                    Verse("3")));

            Delta newDelta = DeltaUsxMapper.ToDelta(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertEmptyText("verse_1_1")
                .InsertVerse("2")
                .InsertEmptyText("verse_1_2")
                .InsertPara("p")
                .InsertEmptyText("verse_1_2/li_1")
                .InsertPara("li")
                .InsertEmptyText("verse_1_2/li_2")
                .InsertPara("li")
                .InsertEmptyText("verse_1_2/p_1")
                .InsertVerse("3")
                .InsertEmptyText("verse_1_3")
                .InsertPara("p")
                .Insert("\n");

            Assert.IsTrue(newDelta.DeepEquals(expected));
        }

        [Test]
        public void ToDelta_SectionHeader()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    Verse("2")),
                Para("s"),
                Para("p",
                    Verse("3")));

            Delta newDelta = DeltaUsxMapper.ToDelta(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertEmptyText("verse_1_1")
                .InsertVerse("2")
                .InsertEmptyText("verse_1_2")
                .InsertPara("p")
                .InsertEmptyText("s_1")
                .InsertPara("s")
                .InsertVerse("3")
                .InsertEmptyText("verse_1_3")
                .InsertPara("p")
                .Insert("\n");

            Assert.IsTrue(newDelta.DeepEquals(expected));
        }

        [Test]
        public void ToDelta_Note()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a footnote",
                    Note("f", "+",
                        Char("fr", "1.1: "),
                        Char("ft", "Refers to "),
                        Char("fq", "a footnote"),
                        ". ",
                        Char("xt", "John 1:1"),
                        " and ",
                        Char("xt", "Mark 1:1"),
                        "."),
                    ", so that we can test it."));

            Delta newDelta = DeltaUsxMapper.ToDelta(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a footnote", "verse_1_1")
                .InsertNote(0, "f", "+", "verse_1_1", Delta.New()
                    .InsertChar("fr", "1.1: ")
                    .InsertChar("ft", "Refers to ")
                    .InsertChar("fq", "a footnote")
                    .Insert(". ")
                    .InsertChar("xt", "John 1:1")
                    .Insert(" and ")
                    .InsertChar("xt", "Mark 1:1")
                    .Insert("."))
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            Assert.IsTrue(newDelta.DeepEquals(expected));
        }

        private XElement Usx(string code, params XElement[] elems)
        {
            return new XElement("usx", new XAttribute("version", "2.5"),
                new XElement("book", new XAttribute("code", code), new XAttribute("style", "id")),
                elems);
        }

        public XElement Para(string style, params object[] contents)
        {
            return new XElement("para", new XAttribute("style", style), contents);
        }

        private XElement Chapter(string number)
        {
            return new XElement("chapter", new XAttribute("number", number), new XAttribute("style", "c"));
        }

        private XElement Verse(string number)
        {
            return new XElement("verse", new XAttribute("number", number), new XAttribute("style", "v"));
        }

        private XElement Char(string style, bool closed, params object[] contents)
        {
            return new XElement("char", new XAttribute("style", style), new XAttribute("closed", closed), contents);
        }

        private XElement Char(string style, params object[] contents)
        {
            return new XElement("char", new XAttribute("style", style), contents);
        }

        private XElement Note(string style, string caller, params object[] contents)
        {
            return new XElement("note", new XAttribute("caller", caller), new XAttribute("style", style), contents);
        }
    }
}
