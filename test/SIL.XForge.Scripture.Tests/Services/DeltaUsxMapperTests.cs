using System.Xml.Linq;
using Microsoft.Extensions.Logging;
using NSubstitute;
using NUnit.Framework;
using ShareDB.RichText;

namespace SIL.XForge.Scripture.Services
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

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

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

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

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
                .InsertBlank("verse_1_1")
                .InsertVerse("2")
                .InsertBlank("verse_1_2")
                .InsertPara("p")
                .InsertBlank("verse_1_2/li_1")
                .InsertPara("li")
                .InsertBlank("verse_1_2/li_2")
                .InsertPara("li")
                .InsertBlank("verse_1_2/p_3")
                .InsertVerse("3")
                .InsertBlank("verse_1_3")
                .InsertPara("p")
                .Insert("\n");

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

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
                .InsertChar("bold", "bd", "verse_1_1")
                .InsertText(" text.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

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
                .InsertNote(0, Delta.New()
                    .InsertChar("1.1: ", "fr")
                    .InsertChar("Refers to ", "ft")
                    .InsertChar("a footnote", "fq")
                    .Insert(". ")
                    .InsertChar("John 1:1", "xt")
                    .Insert(" and ")
                    .InsertChar("Mark 1:1", "xt")
                    .Insert("."), "f", "+", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

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

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Para("p"),
                Para("p"));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_NoParagraphs()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse 1.", "verse_1_1")
                .InsertVerse("2")
                .InsertBlank("verse_1_2")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .Insert("\n");

            DeltaUsxMapper mapper = CreateMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Verse("1"),
                "This is verse 1.",
                Verse("2"),
                Verse("3"),
                "This is verse 3.");
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

            DeltaUsxMapper mapper = CreateMapper();
            Delta newDelta = mapper.ToDelta("12345", usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertBlank("verse_1_1")
                .InsertVerse("2")
                .InsertBlank("verse_1_2")
                .InsertPara("p")
                .InsertBlank("verse_1_2/li_1")
                .InsertPara("li")
                .InsertBlank("verse_1_2/li_2")
                .InsertPara("li")
                .InsertBlank("verse_1_2/p_3")
                .InsertVerse("3")
                .InsertBlank("verse_1_3")
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

            DeltaUsxMapper mapper = CreateMapper();
            Delta newDelta = mapper.ToDelta("12345", usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertBlank("verse_1_1")
                .InsertVerse("2")
                .InsertBlank("verse_1_2")
                .InsertPara("p")
                .InsertBlank("s_1")
                .InsertPara("s")
                .InsertVerse("3")
                .InsertBlank("verse_1_3")
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

            DeltaUsxMapper mapper = CreateMapper();
            Delta newDelta = mapper.ToDelta("12345", usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a footnote", "verse_1_1")
                .InsertNote(0, Delta.New()
                    .InsertChar("1.1: ", "fr")
                    .InsertChar("Refers to ", "ft")
                    .InsertChar("a footnote", "fq")
                    .Insert(". ")
                    .InsertChar("John 1:1", "xt")
                    .Insert(" and ")
                    .InsertChar("Mark 1:1", "xt")
                    .Insert("."), "f", "+", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            Assert.IsTrue(newDelta.DeepEquals(expected));
        }

        [Test]
        public void ToDelta_NoParagraphs()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Verse("1"),
                "This is verse 1.",
                Verse("2"),
                Verse("3"),
                "This is verse 3.");

            DeltaUsxMapper mapper = CreateMapper();
            Delta newDelta = mapper.ToDelta("12345", usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse 1.", "verse_1_1")
                .InsertVerse("2")
                .InsertBlank("verse_1_2")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .Insert("\n");

            Assert.IsTrue(newDelta.DeepEquals(expected));
        }

        private static DeltaUsxMapper CreateMapper()
        {
            return new DeltaUsxMapper(Substitute.For<ILogger<DeltaUsxMapper>>());
        }

        private static XElement Usx(string code, params object[] elems)
        {
            return new XElement("usx", new XAttribute("version", "2.5"),
                new XElement("book", new XAttribute("code", code), new XAttribute("style", "id")),
                elems);
        }

        private static XElement Para(string style, params object[] contents)
        {
            return new XElement("para", new XAttribute("style", style), contents);
        }

        private static XElement Chapter(string number)
        {
            return new XElement("chapter", new XAttribute("number", number), new XAttribute("style", "c"));
        }

        private static XElement Verse(string number)
        {
            return new XElement("verse", new XAttribute("number", number), new XAttribute("style", "v"));
        }

        private static XElement Char(string style, params object[] contents)
        {
            return new XElement("char", new XAttribute("style", style), contents);
        }

        private static XElement Note(string style, string caller, params object[] contents)
        {
            return new XElement("note", new XAttribute("caller", caller), new XAttribute("style", style), contents);
        }
    }
}
