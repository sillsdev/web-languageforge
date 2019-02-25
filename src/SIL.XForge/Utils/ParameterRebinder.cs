using System.Linq.Expressions;

namespace SIL.XForge.Utils
{
    internal class ParameterRebinder : ExpressionVisitor
    {
        private readonly ParameterExpression _parameter;

        public ParameterRebinder(ParameterExpression parameter)
        {
            _parameter = parameter;
        }

        protected override Expression VisitParameter(ParameterExpression p)
        {
            return base.VisitParameter(_parameter);
        }
    }
}
