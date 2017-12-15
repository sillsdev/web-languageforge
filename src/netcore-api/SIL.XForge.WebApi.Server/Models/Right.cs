using System;

namespace SIL.XForge.WebApi.Server.Models
{
    public struct Right : IEquatable<Right>
    {
        public static bool operator ==(Right x, Right y) => x.Equals(y);
        public static bool operator !=(Right x, Right y) => !x.Equals(y);

        public Right(Domain domain, Operation operation)
        {
            Domain = domain;
            Operation = operation;
        }

        public Domain Domain { get; }
        public Operation Operation { get; }

        public bool Equals(Right other)
        {
            return Domain == other.Domain && Operation == other.Operation;
        }

        public override bool Equals(object obj)
        {
            return !(obj is Right) && Equals((Right) obj);
        }

        public override int GetHashCode()
        {
            int code = 23;
            code = code * 31 + Domain.GetHashCode();
            code = code * 31 + Operation.GetHashCode();
            return code;
        }
    }
}
