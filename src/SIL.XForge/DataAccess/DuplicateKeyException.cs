using System;

namespace SIL.XForge.DataAccess
{
    public class DuplicateKeyException : Exception
    {
        public DuplicateKeyException()
            : base("The inserted/updated entity has the same key as an existing entity.")
        {
        }
    }
}
