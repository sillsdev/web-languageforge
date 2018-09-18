/*
 * Copyright 2008 Google Inc. All Rights Reserved.
 * Author: fraser@google.com (Neil Fraser)
 * Author: anteru@developer.shelter13.net (Matthaeus G. Chajdas)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Diff Match and Patch
 * http://code.google.com/p/google-diff-match-patch/
 */

using System.Collections.Generic;

namespace ShareDB.RichText
{
    internal static class DiffExtensions
    {
        internal static List<T> Splice<T>(this List<T> input, int start, int count, params T[] objects)
        {
            IEnumerable<T> enumerable = objects;
            return input.Splice(start, count, enumerable);
        }

        /// <summary>
        /// replaces [count] entries starting at index [start] with the given [objects]
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="input"></param>
        /// <param name="start"></param>
        /// <param name="count"></param>
        /// <param name="objects"></param>
        /// <returns>the deleted objects</returns>
        internal static List<T> Splice<T>(this List<T> input, int start, int count, IEnumerable<T> objects)
        {
            var deletedRange = input.GetRange(start, count);
            input.RemoveRange(start, count);
            input.InsertRange(start, objects);
            return deletedRange;
        }

        internal static IEnumerable<string> SplitLines(this string text)
        {
            var lineStart = 0;
            var lineEnd = -1;
            while (lineEnd < text.Length - 1)
            {

                lineEnd = text.IndexOf('\n', lineStart);
                if (lineEnd == -1)
                {
                    lineEnd = text.Length - 1;
                }
                var line = text.Substring(lineStart, lineEnd + 1 - lineStart);
                yield return line;
                lineStart = lineEnd + 1;
            }
        }
    }

}
