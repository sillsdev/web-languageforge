using System;
using System.Collections.Generic;
using System.Threading;

namespace ShareDB.RichText
{
    internal static class Differ
    {
        /// <summary>
        /// Find the differences between two texts.
        /// </summary>
        /// <param name="text1">Old string to be diffed</param>
        /// <param name="text2">New string to be diffed</param>
        /// <param name="timeoutInSeconds">if specified, certain optimizations may be enabled to meet the time constraint, possibly resulting in a less optimal diff</param>
        /// <param name="checklines">If false, then don't run a line-level diff first to identify the changed areas. If true, then run a faster slightly less optimal diff.</param>
        /// <returns></returns>
        public static List<Diff> Compute(string text1, string text2, float timeoutInSeconds = 0f, bool checklines = true)
        {
            using (var cts = timeoutInSeconds <= 0
                ? new CancellationTokenSource()
                : new CancellationTokenSource(TimeSpan.FromSeconds(timeoutInSeconds))
                )
            {
                return Compute(text1, text2, checklines, cts.Token, timeoutInSeconds > 0);
            }
        }

        public static List<Diff> Compute(string text1, string text2, bool checkLines, CancellationToken token, bool optimizeForSpeed)
        {
            return DiffAlgorithm.Compute(text1, text2, checkLines, token, optimizeForSpeed);
        }
    }
}
