using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using MongoDB.Driver;
using SIL.XForge.Models;
using SIL.XForge.Utils;

namespace SIL.XForge.DataAccess
{
    public class MongoUpdateBuilder<T> : IUpdateBuilder<T> where T : Entity
    {
        private readonly UpdateDefinitionBuilder<T> _builder;
        private readonly List<UpdateDefinition<T>> _defs;

        public MongoUpdateBuilder()
        {
            _builder = Builders<T>.Update;
            _defs = new List<UpdateDefinition<T>>();
        }

        public IUpdateBuilder<T> Set<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _defs.Add(_builder.Set(field, value));
            return this;
        }

        public IUpdateBuilder<T> SetDictionaryValue<TItem>(
            Expression<Func<T, IDictionary<string, TItem>>> dictionaryField, string key, TItem value)
        {
            string fieldStr = ToFieldString(dictionaryField);
            _defs.Add(_builder.Set($"{fieldStr}.{DictionaryKeySerializer.SerializeKey(key)}", value));
            return this;
        }

        public IUpdateBuilder<T> RemoveDictionaryValue<TItem>(
            Expression<Func<T, IDictionary<string, TItem>>> dictionaryField, string key)
        {
            string fieldStr = ToFieldString(dictionaryField);
            _defs.Add(_builder.Unset($"{fieldStr}.{DictionaryKeySerializer.SerializeKey(key)}"));
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _defs.Add(_builder.SetOnInsert(field, value));
            return this;
        }

        public IUpdateBuilder<T> Unset<TField>(Expression<Func<T, TField>> field)
        {
            _defs.Add(_builder.Unset(Expression.Lambda<Func<T, object>>(field.Body, field.Parameters)));
            return this;
        }

        public IUpdateBuilder<T> Inc(Expression<Func<T, int>> field, int value)
        {
            _defs.Add(_builder.Inc(field, value));
            return this;
        }

        public IUpdateBuilder<T> RemoveAll<TItem>(Expression<Func<T, IEnumerable<TItem>>> field,
            Expression<Func<TItem, bool>> predicate)
        {
            _defs.Add(_builder.PullFilter(field, Builders<TItem>.Filter.Where(predicate)));
            return this;
        }

        public IUpdateBuilder<T> Add<TItem>(Expression<Func<T, IEnumerable<TItem>>> field, TItem value)
        {
            _defs.Add(_builder.Push(field, value));
            return this;
        }

        public UpdateDefinition<T> Build()
        {
            if (_defs.Count == 1)
                return _defs.Single();
            return _builder.Combine(_defs);
        }

        private static string ToFieldString<TField>(Expression<Func<T, TField>> field)
        {
            var sb = new StringBuilder();
            foreach (Expression node in ExpressionHelper.Flatten(field))
            {
                if (sb.Length > 0)
                    sb.Append(".");
                switch (node)
                {
                    case MemberExpression memberExpr:
                        sb.Append(memberExpr.Member.Name);
                        break;

                    case MethodCallExpression methodExpr:
                        if (methodExpr.Method.Name != "get_Item")
                        {
                            throw new ArgumentException("Invalid method call in field expression.", nameof(field));
                        }
                        var constant = (ConstantExpression)methodExpr.Arguments[0];
                        var index = (int)constant.Value;
                        sb.Append(index == -1 ? "$" : index.ToString());
                        break;
                }
            }
            return sb.ToString();
        }
    }
}
