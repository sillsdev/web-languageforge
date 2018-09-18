using System;
using System.Collections.Generic;

namespace ShareDB.RichText
{
    internal class BitapAlgorithm
    {
        // Cost of an empty edit operation in terms of edit characters.
        // At what point is no match declared (0.0 = perfection, 1.0 = very loose).
        float _matchThreshold;
        // How far to search for a match (0 = exact location, 1000+ = broad match).
        // A match this many characters away from the expected location will add
        // 1.0 to the score (0.0 is a perfect match).
        int _matchDistance;

        public BitapAlgorithm(MatchSettings settings)
        {
            _matchThreshold = settings.MatchThreshold;
            _matchDistance = settings.MatchDistance;
        }

        /// <summary>
        /// Locate the best instance of 'pattern' in 'text' near 'loc' using the
        /// Bitap algorithm.  Returns -1 if no match found.
        /// </summary>
        /// <param name="text">The text to search.</param>
        /// <param name="pattern">The pattern to search for.</param>
        /// <param name="loc">The location to search around.</param>
        /// <returns>Best match index or -1.</returns>
        public int Match(string text, string pattern, int loc)
        {
            // assert (Match_MaxBits == 0 || pattern.Length <= Match_MaxBits)
            //    : "Pattern too long for this application.";

            // Initialise the alphabet.
            var s = InitAlphabet(pattern);

            // Highest score beyond which we give up.
            double scoreThreshold = _matchThreshold;
            // Is there a nearby exact match? (speedup)
            var bestLoc = text.IndexOf(pattern, loc, StringComparison.Ordinal);
            if (bestLoc != -1)
            {
                scoreThreshold = Math.Min(MatchBitapScore(0, bestLoc, loc,
                    pattern), scoreThreshold);
                // What about in the other direction? (speedup)
                bestLoc = text.LastIndexOf(pattern,
                    Math.Min(loc + pattern.Length, text.Length),
                    StringComparison.Ordinal);
                if (bestLoc != -1)
                {
                    scoreThreshold = Math.Min(MatchBitapScore(0, bestLoc, loc, pattern), scoreThreshold);
                }
            }

            // Initialise the bit arrays.
            var matchmask = 1 << (pattern.Length - 1);
            bestLoc = -1;

            int binMin, binMid;
            var binMax = pattern.Length + text.Length;
            // Empty initialization added to appease C# compiler.
            var lastRd = new int[0];
            for (var d = 0; d < pattern.Length; d++)
            {
                // Scan for the best match; each iteration allows for one more error.
                // Run a binary search to determine how far from 'loc' we can stray at
                // this error level.
                binMin = 0;
                binMid = binMax;
                while (binMin < binMid)
                {
                    if (MatchBitapScore(d, loc + binMid, loc, pattern)
                        <= scoreThreshold)
                    {
                        binMin = binMid;
                    }
                    else
                    {
                        binMax = binMid;
                    }
                    binMid = (binMax - binMin) / 2 + binMin;
                }
                // Use the result from this iteration as the maximum for the next.
                binMax = binMid;
                var start = Math.Max(1, loc - binMid + 1);
                var finish = Math.Min(loc + binMid, text.Length) + pattern.Length;

                var rd = new int[finish + 2];
                rd[finish + 1] = (1 << d) - 1;
                for (var j = finish; j >= start; j--)
                {
                    int charMatch;
                    if (text.Length <= j - 1 || !s.ContainsKey(text[j - 1]))
                    {
                        // Out of range.
                        charMatch = 0;
                    }
                    else
                    {
                        charMatch = s[text[j - 1]];
                    }
                    if (d == 0)
                    {
                        // First pass: exact match.
                        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch;
                    }
                    else
                    {
                        // Subsequent passes: fuzzy match.
                        rd[j] = ((rd[j + 1] << 1) | 1) & charMatch | ((lastRd[j + 1] | lastRd[j]) << 1) | 1 | lastRd[j + 1];
                    }
                    if ((rd[j] & matchmask) != 0)
                    {
                        var score = MatchBitapScore(d, j - 1, loc, pattern);
                        // This match will almost certainly be better than any existing
                        // match.  But check anyway.
                        if (score <= scoreThreshold)
                        {
                            // Told you so.
                            scoreThreshold = score;
                            bestLoc = j - 1;
                            if (bestLoc > loc)
                            {
                                // When passing loc, don't exceed our current distance from loc.
                                start = Math.Max(1, 2 * loc - bestLoc);
                            }
                            else
                            {
                                // Already passed loc, downhill from here on in.
                                break;
                            }
                        }
                    }
                }
                if (MatchBitapScore(d + 1, loc, loc, pattern) > scoreThreshold)
                {
                    // No hope for a (better) match at greater error levels.
                    break;
                }
                lastRd = rd;
            }
            return bestLoc;
        }

        /// <summary>
        /// Initialise the alphabet for the Bitap algorithm.
        /// </summary>
        /// <param name="pattern"></param>
        /// <returns></returns>
        public static Dictionary<char, int> InitAlphabet(string pattern)
        {
            var s = new Dictionary<char, int>();
            var charPattern = pattern.ToCharArray();
            var i = 0;
            foreach (var c in charPattern)
            {
                if (!s.ContainsKey(c))
                    s.Add(c, 0);
                var value = s[c] | (1 << (pattern.Length - i - 1));
                s[c] = value;
                i++;
            }
            return s;
        }

        /// <summary>
        /// Compute and return the score for a match with e errors and x location.
        /// </summary>
        /// <param name="e">Number of errors in match.</param>
        /// <param name="x">Location of match.</param>
        /// <param name="loc">Expected location of match.</param>
        /// <param name="pattern">Pattern being sought.</param>
        /// <returns>Overall score for match (0.0 = good, 1.0 = bad).</returns>
        private double MatchBitapScore(int e, int x, int loc, string pattern)
        {
            var accuracy = (float)e / pattern.Length;
            var proximity = Math.Abs(loc - x);
            if (_matchDistance == 0)
            {
                // Dodge divide by zero error.
                return proximity == 0 ? accuracy : 1.0;
            }
            return accuracy + proximity / (float)_matchDistance;
        }
    }
}
