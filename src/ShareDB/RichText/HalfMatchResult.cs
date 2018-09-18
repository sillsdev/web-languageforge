using System;

namespace ShareDB.RichText
{
    internal struct HalfMatchResult : IEquatable<HalfMatchResult>
    {
        public HalfMatchResult(string prefix1, string suffix1, string prefix2, string suffix2, string commonMiddle)
        {
            if (prefix1 == null) throw new ArgumentNullException("prefix1");
            if (prefix2 == null) throw new ArgumentNullException("prefix2");
            if (suffix1 == null) throw new ArgumentNullException("suffix1");
            if (suffix2 == null) throw new ArgumentNullException("suffix2");
            if (commonMiddle == null) throw new ArgumentNullException("commonMiddle");
            Prefix1 = prefix1;
            Suffix1 = suffix1;
            Prefix2 = prefix2;
            Suffix2 = suffix2;
            CommonMiddle = commonMiddle;
        }

        public HalfMatchResult Reverse()
        {
            return new HalfMatchResult(Prefix2, Suffix2, Prefix1, Suffix1, CommonMiddle);
        }

        public string Prefix1 { get; private set; }
        public string Suffix1 { get; private set; }
        public string CommonMiddle { get; private set; }
        public string Prefix2 { get; private set; }
        public string Suffix2 { get; private set; }
        public bool IsEmpty { get { return string.IsNullOrEmpty(CommonMiddle); }}

        public static readonly HalfMatchResult Empty = new HalfMatchResult();

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != GetType()) return false;
            return Equals((HalfMatchResult) obj);
        }

        public bool Equals(HalfMatchResult other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return string.Equals(Prefix1, other.Prefix1) && string.Equals(Suffix1, other.Suffix1) && string.Equals(CommonMiddle, other.CommonMiddle) && string.Equals(Prefix2, other.Prefix2) && string.Equals(Suffix2, other.Suffix2);
        }
        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (Prefix1 != null ? Prefix1.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Suffix1 != null ? Suffix1.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (CommonMiddle != null ? CommonMiddle.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Prefix2 != null ? Prefix2.GetHashCode() : 0);
                hashCode = (hashCode*397) ^ (Suffix2 != null ? Suffix2.GetHashCode() : 0);
                return hashCode;
            }
        }

        public static bool operator ==(HalfMatchResult left, HalfMatchResult right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(HalfMatchResult left, HalfMatchResult right)
        {
            return !Equals(left, right);
        }

        public static bool operator >(HalfMatchResult left, HalfMatchResult right)
        {
            return left.CommonMiddle.Length > right.CommonMiddle.Length;
        }

        public static bool operator <(HalfMatchResult left, HalfMatchResult right)
        {
            return left.CommonMiddle.Length < right.CommonMiddle.Length;
        }

        public override string ToString()
        {
            return $"[{Prefix1}/{Prefix2}] - {CommonMiddle} - [{Suffix1}/{Suffix2}]";
        }
    }
}
