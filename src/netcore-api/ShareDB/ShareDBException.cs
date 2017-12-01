using System;

namespace ShareDB
{
    public class ShareDBException : Exception
    {
        public ShareDBException(string message, int code)
            : base(message)
        {
            Code = code;
        }

        public int Code { get; }
    }
}
