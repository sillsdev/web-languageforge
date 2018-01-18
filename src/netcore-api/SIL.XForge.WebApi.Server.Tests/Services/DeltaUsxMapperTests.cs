using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Linq;
using NUnit.Framework;
using ShareDB.RichText;

namespace SIL.XForge.WebApi.Server.Services
{
    [TestFixture]
    public class DeltaUsxMapperTests
    {
        [Test]
        public void UpdateUsx_HeaderPara()
        {
            var delta = Delta.New()
                .Insert("Philemon")
                .InsertPara("h");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("PHM", null, delta);

            XElement expected = Usx("PHM",
                Para("h", "Philemon"));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void UpdateUsx_VerseText()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .Insert("Verse text.")
                .InsertPara("p");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "Verse text."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
        }

        [Test]
        public void UpdateUsx_CharText()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .Insert("This is some ")
                .InsertChar("bd", "bold")
                .Insert(" text.")
                .InsertPara("p");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("PHM", null, delta);

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
        public void UpdateUsx_Note()
        {
            var delta = Delta.New()
                .InsertChapter("1")
                .InsertVerse("1")
                .Insert("This is a verse with a footnote")
                .InsertNote("_note_1", "f", "+", Delta.New()
                    .InsertChar("fr", "1.1: ")
                    .InsertChar("ft", "Refers to ")
                    .InsertChar("fq", "a footnote."))
                .Insert(", so that we can test it.")
                .InsertPara("p");

            XElement newUsxElem = DeltaUsxMapper.ToUsx("PHM", null, delta);

            XElement expected = Usx("PHM",
                Chapter("1"),
                Para("p",
                    Verse("1"),
                    "This is a verse with a footnote",
                    Note("f", "+",
                        Char("fr", "1.1: "),
                        Char("ft", "Refers to "),
                        Char("fq", "a footnote.")),
                    ", so that we can test it."));
            Assert.IsTrue(XNode.DeepEquals(newUsxElem, expected));
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
