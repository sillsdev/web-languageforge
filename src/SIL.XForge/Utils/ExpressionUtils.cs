using System;
using System.Linq.Expressions;

namespace SIL.XForge.Utils
{
    public static class ExpressionUtils
    {
        public static Expression<Func<T, bool>> ChangePredicateType<T>(LambdaExpression predicate)
        {
            ParameterExpression param = Expression.Parameter(typeof(T), "x");
            var body = RebindParameter(param, predicate);
            return Expression.Lambda<Func<T, bool>>(body, param);
        }

        public static Expression RebindParameter(ParameterExpression param, LambdaExpression lambda)
        {
            var e = new ParameterRebinder(param);
            return e.Visit(lambda.Body);
        }
    }
}
