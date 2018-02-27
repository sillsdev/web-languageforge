namespace ShareDB.RichText
{
    internal class MatchSettings
    {
        /// <summary>
        /// At what point is no match declared (0.0 = perfection, 1.0 = very loose).
        /// </summary>
        public float MatchThreshold { get; }

        /// <summary>
        /// How far to search for a match (0 = exact location, 1000+ = broad match).
        /// A match this many characters away from the expected location will add
        /// 1.0 to the score (0.0 is a perfect match).
        /// </summary>
        public int MatchDistance { get; }

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="treshold">At what point is no match declared (0.0 = perfection, 1.0 = very loose).</param>
        /// <param name="distance"> How far to search for a match (0 = exact location, 1000+ = broad match).
        /// A match this many characters away from the expected location will add
        /// 1.0 to the score (0.0 is a perfect match).
        /// </param>
        public MatchSettings(float treshold, int distance)
        {
            MatchThreshold = treshold;
            MatchDistance = distance;
        }

        public static MatchSettings Default { get; } = new MatchSettings(0.5f, 1000);
    }
}
