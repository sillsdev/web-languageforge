using System.Collections.Generic;
using System.Linq.Expressions;
using System.Reflection;

namespace SIL.XForge.Utils
{
    internal class FieldExpressionFlattener : ExpressionVisitor
    {
        private readonly Stack<Expression> _nodes = new Stack<Expression>();

        public IEnumerable<Expression> Nodes => _nodes;

        protected override Expression VisitMember(MemberExpression node)
        {
            if (node.Member is PropertyInfo)
                _nodes.Push(node);
            return base.VisitMember(node);
        }

        protected override Expression VisitMethodCall(MethodCallExpression node)
        {
            _nodes.Push(node);
            return base.VisitMethodCall(node);
        }
    }
}
