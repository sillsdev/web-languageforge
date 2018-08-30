namespace SIL.XForge.WebApi.Server.Utils
{
    public static class Attempt
    {
        public static Attempt<T> Success<T>(T result)
        {
            return new Attempt<T>(true, result);
        }

        public static Attempt<T> Failure<T>(T result)
        {
            return new Attempt<T>(false, result);
        }
    }

    public struct Attempt<T>
    {
        public static Attempt<T> Failure { get; } = new Attempt<T>();

        public Attempt(T result)
            : this(true, result)
        {
        }

        public Attempt(bool success, T result = default(T))
        {
            Success = success;
            Result = result;
        }

        public T Result { get; }
        public bool Success { get; }

        public bool TryResult(out T result)
        {
            result = Result;
            return Success;
        }
    }
}
