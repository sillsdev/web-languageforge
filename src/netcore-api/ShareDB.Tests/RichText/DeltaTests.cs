using Newtonsoft.Json.Linq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;

namespace ShareDB.RichText
{
    [TestFixture]
    public class DeltaTests
    {
        [Test]
        public void Insert_EmptyText_EmptyOps()
        {
            var delta = Delta.New().Insert("");
            Assert.That(delta.Ops, Is.Empty);
        }

        [Test]
        public void Insert_Text_OneOp()
        {
            var delta = Delta.New().Insert("test");
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = "test" })));
        }

        [Test]
        public void Insert_ConsecutiveTexts_MergeOps()
        {
            var delta = Delta.New().Insert("a").Insert("b");
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = "ab" })));
        }

        [Test]
        public void Insert_ConsecutiveTextsMatchingAttrs_MergeOps()
        {
            var delta = Delta.New()
                .Insert("a", Obj(new { bold = true }))
                .Insert("b", Obj(new { bold = true }));
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = "ab", attributes = new { bold = true } })));
        }

        [Test]
        public void Insert_ConsecutiveTextsDifferentAttrs_TwoOps()
        {
            var delta = Delta.New()
                .Insert("a", Obj(new { bold = true }))
                .Insert("b");
            Assert.That(delta.Ops, Is.EqualTo(Objs(
                new { insert = "a", attributes = new { bold = true } },
                new { insert = "b" })));
        }

        [Test]
        public void Insert_ConsecutiveEmbedsMatchingAttrs_TwoOps()
        {
            var delta = Delta.New()
                .Insert(1, Obj(new { alt = "Description" }))
                .Insert(Obj(new { url = "http://quilljs.com" }), Obj(new { alt = "Description" }));
            Assert.That(delta.Ops, Is.EqualTo(Objs(
                new { insert = 1, attributes = new { alt = "Description" } },
                new { insert = new { url = "http://quilljs.com" }, attributes = new { alt = "Description" } })));
        }

        [Test]
        public void Insert_TextAttributes_OneOp()
        {
            JToken attrs = Obj(new { bold = true });
            var delta = Delta.New().Insert("test", attrs);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = "test", attributes = attrs })));
        }

        [Test]
        public void Insert_Embed_OneOp()
        {
            var delta = Delta.New().Insert(1);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = 1 })));
        }

        [Test]
        public void Insert_EmbedAttributes_OneOp()
        {
            JToken attrs = Obj(new { url = "http://quilljs.com", alt = "Quill" });
            var delta = Delta.New().Insert(1, attrs);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = 1, attributes = attrs })));
        }

        [Test]
        public void Insert_ObjEmbedAttributes_OneOp()
        {
            JToken embed = Obj(new { url = "http://quilljs.com" });
            JToken attrs = Obj(new { alt = "Quill" });
            var delta = Delta.New().Insert(embed, attrs);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { insert = embed, attributes = attrs })));
        }

        [Test]
        public void Insert_AfterDelete_SwapOps()
        {
            var delta = Delta.New().Delete(1).Insert("a");
            var expected = Delta.New().Insert("a").Delete(1);
            Assert.That(delta, Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Insert_AfterDeleteWithMerge_MergeOps()
        {
            var delta = Delta.New().Insert("a").Delete(1).Insert("b");
            var expected = Delta.New().Insert("ab").Delete(1);
            Assert.That(delta, Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Insert_AfterDeleteNoMerge_SwapOps()
        {
            var delta = Delta.New().Insert(1).Delete(1).Insert("a");
            var expected = Delta.New().Insert(1).Insert("a").Delete(1);
            Assert.That(delta, Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Insert_EmptyAttributes_IgnoreAttributes()
        {
            var delta = Delta.New().Insert("a", new JObject());
            var expected = Delta.New().Insert("a");
            Assert.That(delta, Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Retain_Zero_EmptyOps()
        {
            var delta = Delta.New().Retain(0);
            Assert.That(delta.Ops, Is.Empty);
        }

        [Test]
        public void Retain_Positive_OneOp()
        {
            var delta = Delta.New().Retain(2);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { retain = 2 })));
        }

        [Test]
        public void Retain_Attributes_OneOp()
        {
            JToken attrs = Obj(new { bold = true });
            var delta = Delta.New().Retain(1, attrs);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { retain = 1, attributes = attrs })));
        }

        [Test]
        public void Retain_ConsecutiveRetainsMatchingAttrs_MergeOps()
        {
            var delta = Delta.New()
                .Retain(1, Obj(new { bold = true }))
                .Retain(3, Obj(new { bold = true }));
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { retain = 4, attributes = new { bold = true } })));
        }

        [Test]
        public void Retain_ConsecutiveRetainsDifferentAttrs_TwoOps()
        {
            var delta = Delta.New()
                .Retain(1, Obj(new { bold = true }))
                .Retain(3);
            Assert.That(delta.Ops, Is.EqualTo(Objs(
                new { retain = 1, attributes = new { bold = true } },
                new { retain = 3 })));
        }

        [Test]
        public void Retain_EmptyAttributes_IgnoreAttributes()
        {
            var delta = Delta.New().Retain(2, new JObject()).Delete(1);
            var expected = Delta.New().Retain(2).Delete(1);
            Assert.That(delta, Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Delete_Zero_EmptyOps()
        {
            var delta = Delta.New().Delete(0);
            Assert.That(delta.Ops, Is.Empty);
        }

        [Test]
        public void Delete_Positive_OneOp()
        {
            var delta = Delta.New().Delete(1);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { delete = 1 })));
        }

        [Test]
        public void Delete_ConsecutiveDeletes_MergeOps()
        {
            var delta = Delta.New().Delete(2).Delete(3);
            Assert.That(delta.Ops, Is.EqualTo(Objs(new { delete = 5 })));
        }

        [Test]
        public void Compose_InsertInsert_TwoOps()
        {
            var a = Delta.New().Insert("A");
            var b = Delta.New().Insert("B");
            var expected = Delta.New().Insert("B").Insert("A");
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_InsertRetain_MergeOps()
        {
            var a = Delta.New().Insert("A");
            var b = Delta.New().Retain(1, Obj(new { bold = true, color = "red", font = (string) null }));
            var expected = Delta.New().Insert("A", Obj(new { bold = true, color = "red" }));
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_InsertDelete_MergeOps()
        {
            var a = Delta.New().Insert("A");
            var b = Delta.New().Delete(1);
            var expected = Delta.New();
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_DeleteInsert_TwoOps()
        {
            var a = Delta.New().Delete(1);
            var b = Delta.New().Insert("B");
            var expected = Delta.New().Insert("B").Delete(1);
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_DeleteRetain_TwoOps()
        {
            var a = Delta.New().Delete(1);
            var b = Delta.New().Retain(1, Obj(new { bold = true, color = "red" }));
            var expected = Delta.New().Delete(1).Retain(1, Obj(new { bold = true, color = "red" }));
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_DeleteDelete_MergeOps()
        {
            var a = Delta.New().Delete(1);
            var b = Delta.New().Delete(1);
            var expected = Delta.New().Delete(2);
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RetainInsert_TwoOps()
        {
            var a = Delta.New().Retain(1, Obj(new { color = "blue" }));
            var b = Delta.New().Insert("B");
            var expected = Delta.New().Insert("B").Retain(1, Obj(new { color = "blue" }));
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RetainRetain_MergeOps()
        {
            var a = Delta.New().Retain(1, Obj(new { color = "blue" }));
            var b = Delta.New().Retain(1, Obj(new { bold = true, color = "red", font = (string) null }));
            var expected = Delta.New().Retain(1, Obj(new { bold = true, color = "red", font = (string) null }));
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RetainDelete_MergeOps()
        {
            var a = Delta.New().Retain(1, Obj(new { color = "blue" }));
            var b = Delta.New().Delete(1);
            var expected = Delta.New().Delete(1);
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_InsertInMiddle_MergeOps()
        {
            var a = Delta.New().Insert("Hello");
            var b = Delta.New().Retain(3).Insert("X");
            var expected = Delta.New().Insert("HelXlo");
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_InsertDeleteOrdering_MergeOps()
        {
            var a = Delta.New().Insert("Hello");
            var b = Delta.New().Insert("Hello");
            var insertFirst = Delta.New().Retain(3).Insert("X").Delete(1);
            var deleteFirst = Delta.New().Retain(3).Delete(1).Insert("X");
            var expected = Delta.New().Insert("HelXo");
            Assert.That(a.Compose(insertFirst), Is.EqualTo(expected).Using(Delta.EqualityComparer));
            Assert.That(b.Compose(deleteFirst), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_InsertEmbedRetain_MergeOps()
        {
            var a = Delta.New().Insert(1, Obj(new { src = "http://quilljs.com/image.png" }));
            var b = Delta.New().Retain(1, Obj(new { alt = "logo" }));
            var expected = Delta.New().Insert(1, Obj(new { src = "http://quilljs.com/image.png", alt = "logo" }));
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_DeleteEntireText_MergeOps()
        {
            var a = Delta.New().Retain(4).Insert("Hello");
            var b = Delta.New().Delete(9);
            var expected = Delta.New().Delete(4);
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RetainMoreThanText_MergeOps()
        {
            var a = Delta.New().Insert("Hello");
            var b = Delta.New().Retain(10);
            var expected = Delta.New().Insert("Hello");
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RetainEmbed_MergeOps()
        {
            var a = Delta.New().Insert(1);
            var b = Delta.New().Retain(1);
            var expected = Delta.New().Insert(1);
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RemoveAttributes_MergeOps()
        {
            var a = Delta.New().Insert("A", Obj(new { bold = true }));
            var b = Delta.New().Retain(1, Obj(new { bold = (bool?) null }));
            var expected = Delta.New().Insert("A");
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_RemoveEmbedAttributes_MergeOps()
        {
            var a = Delta.New().Insert(2, Obj(new { bold = true }));
            var b = Delta.New().Retain(1, Obj(new { bold = (bool?) null }));
            var expected = Delta.New().Insert(2);
            Assert.That(a.Compose(b), Is.EqualTo(expected).Using(Delta.EqualityComparer));
        }

        [Test]
        public void Compose_Immutability()
        {
            JToken attr1 = Obj(new { bold = true });
            JToken attr2 = Obj(new { bold = true });
            var a1 = Delta.New().Insert("Test", attr1);
            var a2 = Delta.New().Insert("Test", attr1);
            var b1 = Delta.New().Retain(1, Obj(new { color = "red" })).Delete(2);
            var b2 = Delta.New().Retain(1, Obj(new { color = "red" })).Delete(2);
            var expected = Delta.New().Insert("T", Obj(new { color = "red", bold = true })).Insert("t", attr1);
            Assert.That(a1.Compose(b1), Is.EqualTo(expected).Using(Delta.EqualityComparer));
            Assert.That(a1, Is.EqualTo(a2).Using(Delta.EqualityComparer));
            Assert.That(b1, Is.EqualTo(b2).Using(Delta.EqualityComparer));
            Assert.That(attr1, Is.EqualTo(attr2));
        }

        private static IEnumerable<JToken> Objs(params object[] objs)
        {
            return objs.Select(Obj);
        }

        private static JToken Obj(object obj)
        {
            return JObject.FromObject(obj);
        }
    }
}
