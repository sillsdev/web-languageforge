using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using MongoDB.Bson;
using SIL.Machine.Corpora;
using SIL.Machine.Tokenization;

namespace SIL.XForge.Scripture.Services
{
    public class XForgeRichText : IText
    {
        public XForgeRichText(ITokenizer<string, int> segmentTokenizer, ITokenizer<string, int> wordTokenizer,
            string projectId, BsonDocument doc)
        {
            var id = (string) doc["_id"];
            int index = id.IndexOf(":", StringComparison.Ordinal);
            Id = $"{projectId}_{id.Substring(0, index)}";
            Segments = GetSegments(segmentTokenizer, wordTokenizer, doc).ToArray();
        }

        public string Id { get; }

        public IEnumerable<TextSegment> Segments { get; }

        private static IEnumerable<TextSegment> GetSegments(ITokenizer<string, int> segmentTokenizer,
            ITokenizer<string, int> wordTokenizer, BsonDocument doc)
        {
            var ops = (BsonArray) doc["ops"];
            var sb = new StringBuilder();
            foreach (BsonDocument op in ops.Cast<BsonDocument>())
            {
                if (op.TryGetValue("insert", out BsonValue value) && value.BsonType == BsonType.String)
                    sb.Append(value);
            }

            int i = 1;
            foreach (string segment in segmentTokenizer.TokenizeToStrings(sb.ToString()))
            {
                yield return new TextSegment(i, wordTokenizer.TokenizeToStrings(segment).ToArray());
                i++;
            }
        }
    }
}
