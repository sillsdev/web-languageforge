using System.Collections.Generic;
using System.Text;

namespace ShareDB.RichText
{
    internal class LineToCharCompressor
    {
        // e.g. _lineArray[4] == "Hello\n"
        // e.g. _lineHash["Hello\n"] == 4
        readonly List<string> _lineArray = new List<string>();
        readonly Dictionary<string, int> _lineHash = new Dictionary<string, int>();

        /// <summary>
        /// Compresses all lines of a text to a series of indexes (starting at \u0001, ending at (char)text.Length)
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public string Compress(string text)
        {
            var sb = new StringBuilder();
            foreach (var line in text.SplitLines())
            {
                if (!_lineHash.ContainsKey(line))
                {
                    _lineArray.Add(line);
                     // "\u0000" is a valid character, but various debuggers don't like it.
                    // Therefore, add Count, not Count - 1
                    _lineHash.Add(line, _lineArray.Count);
                }
                sb.Append((char)_lineHash[line]);
            }
            return sb.ToString();
        }

        public string Decompress(string text)
        {
            var sb = new StringBuilder();
            foreach (var c in text)
            {
                sb.Append(_lineArray[c - 1]);
            }
            return sb.ToString();
        }
    }
}
