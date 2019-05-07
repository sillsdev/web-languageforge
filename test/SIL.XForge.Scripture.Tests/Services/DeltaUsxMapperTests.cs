using System.Collections.Generic;
using System.Xml.Linq;
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

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

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

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

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

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

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

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

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
                .InsertNote(Delta.New()
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

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

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
        public void ToUsx_Figure()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a figure", "verse_1_1")
                .InsertFigure("file.jpg", "col", "PHM 1:1", "Caption", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a figure",
                    Figure("file.jpg", "col", "PHM 1:1", "Caption"),
                    ", so that we can test it."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_NestedChars()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertChar("1", new[] { "bd", "sup" }, "verse_1_1")
                .InsertChar("This is", "bd", "verse_1_1")
                .InsertChar("2", new[] { "bd", "sup" }, "verse_1_1")
                .InsertChar(" bold text.", "bd", "verse_1_1")
                .InsertChar("3", new[] { "bd", "sup" }, "verse_1_1")
                .InsertText(" This is normal text.", "verse_1_1")
                .InsertPara("p");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    Char("bd",
                        Char("sup", "1"),
                        "This is",
                        Char("sup", "2"),
                        " bold text.",
                        Char("sup", "3")),
                    " This is normal text."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_Ref()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a footnote", "verse_1_1")
                .InsertNote(Delta.New()
                    .InsertChar("1.1: ", "fr")
                    .InsertChar("Refers to ", "ft")
                    .InsertChar("a footnote", "fq")
                    .Insert(". ")
                    .InsertCharRef("John 1:1", "xt", "JHN 1:1")
                    .Insert(" and ")
                    .InsertCharRef("Mark 1:1", "xt", "MRK 1:1")
                    .Insert("."), "f", "+", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p")
                .Insert("\n");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

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
                        Char("xt", Ref("JHN 1:1", "John 1:1")),
                        " and ",
                        Char("xt", Ref("MRK 1:1", "Mark 1:1")),
                        "."),
                    ", so that we can test it."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_OptBreak()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a line break", "verse_1_1")
                .InsertOptBreak("verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a line break",
                    OptBreak(),
                    ", so that we can test it."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_Milestone()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a milestone", "verse_1_1")
                .InsertMilestone("ts", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a milestone",
                    Milestone("ts"),
                    ", so that we can test it."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_TableAtEnd()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse ", "verse_1_1")
                .InsertChar("1", "it", "verse_1_1")
                .InsertText(".", "verse_1_1")
                .InsertCell(1, 1, "tc1", "start")
                .InsertVerse("2")
                .InsertText("This is verse 2.", "verse_1_2")
                .InsertCell(1, 1, "tc2", "start")
                .InsertCell(1, 2, "tc1", "start")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .InsertCell(1, 2, "tc2", "start");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("1"), "This is verse ", Char("it", "1"), "."),
                        Cell("tc2", "start", Verse("2"), "This is verse 2.")),
                    Row(
                        Cell("tc1", "start"),
                        Cell("tc2", "start", Verse("3"), "This is verse 3."))));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_TableInMiddle()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse ", "verse_1_1")
                .InsertChar("1", "it", "verse_1_1")
                .InsertText(".", "verse_1_1")
                .InsertCell(1, 1, "tc1", "start")
                .InsertVerse("2")
                .InsertText("This is verse 2.", "verse_1_2")
                .InsertCell(1, 1, "tc2", "start")
                .InsertCell(1, 2, "tc1", "start")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .InsertCell(1, 2, "tc2", "start")
                .InsertVerse("4")
                .InsertText("This is verse 4.", "verse_1_4")
                .InsertPara("p");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("1"), "This is verse ", Char("it", "1"), "."),
                        Cell("tc2", "start", Verse("2"), "This is verse 2.")),
                    Row(
                        Cell("tc1", "start"),
                        Cell("tc2", "start", Verse("3"), "This is verse 3."))),
                Para("p", Verse("4"), "This is verse 4."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_AdjacentTables()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse 1.", "verse_1_1")
                .InsertCell(1, 1, "tc1", "start")
                .InsertVerse("2")
                .InsertText("This is verse 2.", "verse_1_2")
                .InsertCell(1, 1, "tc2", "start")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .InsertCell(1, 2, "tc1", "start")
                .InsertVerse("4")
                .InsertText("This is verse 4.", "verse_1_4")
                .InsertCell(1, 2, "tc2", "start")
                .InsertVerse("5")
                .InsertText("This is verse 5.", "verse_1_5")
                .InsertCell(2, 1, "tc1", "start")
                .InsertVerse("6")
                .InsertText("This is verse 6.", "verse_1_6")
                .InsertCell(2, 1, "tc2", "start")
                .InsertVerse("7")
                .InsertText("This is verse 7.", "verse_1_7")
                .InsertCell(2, 2, "tc1", "start")
                .InsertVerse("8")
                .InsertText("This is verse 8.", "verse_1_8")
                .InsertCell(2, 2, "tc2", "start");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Chapter("1"),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("1"), "This is verse 1."),
                        Cell("tc2", "start", Verse("2"), "This is verse 2.")),
                    Row(
                        Cell("tc1", "start", Verse("3"), "This is verse 3."),
                        Cell("tc2", "start", Verse("4"), "This is verse 4."))),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("5"), "This is verse 5."),
                        Cell("tc2", "start", Verse("6"), "This is verse 6.")),
                    Row(
                        Cell("tc1", "start", Verse("7"), "This is verse 7."),
                        Cell("tc2", "start", Verse("8"), "This is verse 8."))));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_ConsecutiveSameStyleEmptyParas()
        {
            var delta = Delta.New()
                .InsertPara("p")
                .InsertPara("p");

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, new[] { delta });

            XElement expected = Usx("PHM",
                Para("p"),
                Para("p"));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void ToUsx_NoParagraphs()
        {
            var deltas = new[]
            {
                Delta.New()
                    .InsertChapter("1")
                    .InsertVerse("1")
                    .InsertText("This is verse 1.", "verse_1_1")
                    .InsertVerse("2")
                    .InsertBlank("verse_1_2")
                    .InsertVerse("3")
                    .InsertText("This is verse 3.", "verse_1_3")
                    .Insert("\n"),
                Delta.New()
                    .InsertChapter("2")
                    .InsertVerse("1")
                    .InsertBlank("verse_2_1")
                    .InsertVerse("2")
                    .InsertBlank("verse_2_2")
                    .Insert("\n")
            };

            var mapper = new DeltaUsxMapper();
            XElement newUsxElem = mapper.ToUsx("2.5", "PHM", null, deltas);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Verse("1"),
                "This is verse 1.",
                Verse("2"),
                Verse("3"),
                "This is verse 3.",
                Chapter("2"),
                Verse("1"),
                Verse("2"));
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

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

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
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(3));
        }

        [Test]
        public void ToDelta_SectionHeader()
        {
            XElement usxElem = Usx("PHM",
                Para("mt", "Philemon"),
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    Verse("2")),
                Para("s"),
                Para("p",
                    Verse("3")));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertText("Philemon", "mt_1")
                .InsertPara("mt")
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
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(3));
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

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a footnote", "verse_1_1")
                .InsertNote(Delta.New()
                    .InsertChar("1.1: ", "fr")
                    .InsertChar("Refers to ", "ft")
                    .InsertChar("a footnote", "fq")
                    .Insert(". ")
                    .InsertChar("John 1:1", "xt")
                    .Insert(" and ")
                    .InsertChar("Mark 1:1", "xt")
                    .Insert("."), "f", "+", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(1));
        }

        [Test]
        public void ToDelta_Figure()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a figure",
                    Figure("file.jpg", "col", "PHM 1:1", "Caption"),
                    ", so that we can test it."));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a figure", "verse_1_1")
                .InsertFigure("file.jpg", "col", "PHM 1:1", "Caption", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(1));
        }

        [Test]
        public void ToDelta_NestedChars()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    Char("bd",
                        Char("sup", "1"),
                        "This is",
                        Char("sup", "2"),
                        " bold text.",
                        Char("sup", "3")),
                    " This is normal text."));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertChar("1", new[] { "bd", "sup" }, "verse_1_1")
                .InsertChar("This is", "bd", "verse_1_1")
                .InsertChar("2", new[] { "bd", "sup" }, "verse_1_1")
                .InsertChar(" bold text.", "bd", "verse_1_1")
                .InsertChar("3", new[] { "bd", "sup" }, "verse_1_1")
                .InsertText(" This is normal text.", "verse_1_1")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(1));
        }

        [Test]
        public void ToDelta_Ref()
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
                        Char("xt", Ref("JHN 1:1", "John 1:1")),
                        " and ",
                        Char("xt", Ref("MRK 1:1", "Mark 1:1")),
                        "."),
                    ", so that we can test it."));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a footnote", "verse_1_1")
                .InsertNote(Delta.New()
                    .InsertChar("1.1: ", "fr")
                    .InsertChar("Refers to ", "ft")
                    .InsertChar("a footnote", "fq")
                    .Insert(". ")
                    .InsertCharRef("John 1:1", "xt", "JHN 1:1")
                    .Insert(" and ")
                    .InsertCharRef("Mark 1:1", "xt", "MRK 1:1")
                    .Insert("."), "f", "+", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(1));
        }

        [Test]
        public void ToDelta_OptBreak()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a line break",
                    OptBreak(),
                    ", so that we can test it."));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a line break", "verse_1_1")
                .InsertOptBreak("verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(1));
        }

        [Test]
        public void ToDelta_Milestone()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a line break",
                    Milestone("ts"),
                    ", so that we can test it."));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is a verse with a line break", "verse_1_1")
                .InsertMilestone("ts", "verse_1_1")
                .InsertText(", so that we can test it.", "verse_1_1")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(1));
        }

        [Test]
        public void ToDelta_TableAtEnd()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("1"), "This is verse ", Char("it", "1"), "."),
                        Cell("tc2", "start", Verse("2"), "This is verse 2.")),
                    Row(
                        Cell("tc1", "start"),
                        Cell("tc2", "start", Verse("3"), "This is verse 3."))));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse ", "verse_1_1")
                .InsertChar("1", "it", "verse_1_1")
                .InsertText(".", "verse_1_1")
                .InsertCell(1, 1, "tc1", "start")
                .InsertVerse("2")
                .InsertText("This is verse 2.", "verse_1_2")
                .InsertCell(1, 1, "tc2", "start")
                .InsertCell(1, 2, "tc1", "start")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .InsertCell(1, 2, "tc2", "start");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(3));
        }

        [Test]
        public void ToDelta_TableInMiddle()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("1"), "This is verse ", Char("it", "1"), "."),
                        Cell("tc2", "start", Verse("2"), "This is verse 2.")),
                    Row(
                        Cell("tc1", "start"),
                        Cell("tc2", "start", Verse("3"), "This is verse 3."))),
                Para("p", Verse("4"), "This is verse 4."));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse ", "verse_1_1")
                .InsertChar("1", "it", "verse_1_1")
                .InsertText(".", "verse_1_1")
                .InsertCell(1, 1, "tc1", "start")
                .InsertVerse("2")
                .InsertText("This is verse 2.", "verse_1_2")
                .InsertCell(1, 1, "tc2", "start")
                .InsertCell(1, 2, "tc1", "start")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .InsertCell(1, 2, "tc2", "start")
                .InsertVerse("4")
                .InsertText("This is verse 4.", "verse_1_4")
                .InsertPara("p");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(4));
        }

        [Test]
        public void ToDelta_AdjacentTables()
        {
            XElement usxElem = Usx("PHM",
                Chapter("1"),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("1"), "This is verse 1."),
                        Cell("tc2", "start", Verse("2"), "This is verse 2.")),
                    Row(
                        Cell("tc1", "start", Verse("3"), "This is verse 3."),
                        Cell("tc2", "start", Verse("4"), "This is verse 4."))),
                Table(
                    Row(
                        Cell("tc1", "start", Verse("5"), "This is verse 5."),
                        Cell("tc2", "start", Verse("6"), "This is verse 6.")),
                    Row(
                        Cell("tc1", "start", Verse("7"), "This is verse 7."),
                        Cell("tc2", "start", Verse("8"), "This is verse 8."))));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse 1.", "verse_1_1")
                .InsertCell(1, 1, "tc1", "start")
                .InsertVerse("2")
                .InsertText("This is verse 2.", "verse_1_2")
                .InsertCell(1, 1, "tc2", "start")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .InsertCell(1, 2, "tc1", "start")
                .InsertVerse("4")
                .InsertText("This is verse 4.", "verse_1_4")
                .InsertCell(1, 2, "tc2", "start")
                .InsertVerse("5")
                .InsertText("This is verse 5.", "verse_1_5")
                .InsertCell(2, 1, "tc1", "start")
                .InsertVerse("6")
                .InsertText("This is verse 6.", "verse_1_6")
                .InsertCell(2, 1, "tc2", "start")
                .InsertVerse("7")
                .InsertText("This is verse 7.", "verse_1_7")
                .InsertCell(2, 2, "tc1", "start")
                .InsertVerse("8")
                .InsertText("This is verse 8.", "verse_1_8")
                .InsertCell(2, 2, "tc2", "start");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(8));
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
                "This is verse 3.",
                Chapter("2"),
                Verse("1"),
                Verse("2-3"));

            var mapper = new DeltaUsxMapper();
            IReadOnlyDictionary<int, (Delta Delta, int LastVerse)> newDeltas = mapper.ToChapterDeltas(usxElem);

            var expected1 = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .InsertText("This is verse 1.", "verse_1_1")
                .InsertVerse("2")
                .InsertBlank("verse_1_2")
                .InsertVerse("3")
                .InsertText("This is verse 3.", "verse_1_3")
                .Insert("\n");
            var expected2 = Delta.New()
                .InsertChapter("2")
                .InsertVerse("1")
                .InsertBlank("verse_2_1")
                .InsertVerse("2-3")
                .InsertBlank("verse_2_2-3")
                .Insert("\n");

            Assert.IsTrue(newDeltas[1].Delta.DeepEquals(expected1));
            Assert.That(newDeltas[1].LastVerse, Is.EqualTo(3));
            Assert.IsTrue(newDeltas[2].Delta.DeepEquals(expected2));
            Assert.That(newDeltas[2].LastVerse, Is.EqualTo(3));
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

        private static XElement Ref(string loc, string text)
        {
            return new XElement("ref", new XAttribute("loc", loc), text);
        }

        private static XElement Note(string style, string caller, params object[] contents)
        {
            return new XElement("note", new XAttribute("style", style), new XAttribute("caller", caller), contents);
        }

        private static XElement Figure(string file, string size, string reference, string text)
        {
            return new XElement("figure",
                new XAttribute("style", "fig"),
                new XAttribute("file", file),
                new XAttribute("size", size),
                new XAttribute("ref", reference),
                text);
        }

        private static XElement OptBreak()
        {
            return new XElement("optbreak");
        }

        private static XElement Milestone(string style)
        {
            return new XElement("ms", new XAttribute("style", style));
        }

        private static XElement Table(params object[] contents)
        {
            return new XElement("table", contents);
        }

        private static XElement Row(params object[] contents)
        {
            return new XElement("row", contents);
        }

        private static XElement Cell(string style, string align, params object[] contents)
        {
            return new XElement("cell", new XAttribute("style", style), new XAttribute("align", align), contents);
        }
    }
}
