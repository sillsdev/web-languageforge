using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public class MemoryUpdateBuilder<T> : IUpdateBuilder<T> where T : Entity, new()
    {
        private readonly Expression<Func<T, bool>> _filter;
        private readonly T _entity;
        private readonly bool _isInsert;

        public MemoryUpdateBuilder(Expression<Func<T, bool>> filter, T entity, bool isInsert)
        {
            _filter = filter;
            _entity = entity;
            _isInsert = isInsert;
        }

        public IUpdateBuilder<T> Set<TField>(string fieldName, TField value)
        {
            PropertyInfo prop = typeof(T).GetProperty(fieldName);
            prop.SetValue(_entity, value);
            return this;
        }

        public IUpdateBuilder<T> Set<TField>(string collectionFieldName, string fieldName, TField value,
            int index = -1)
        {
            PropertyInfo collectionProp = typeof(T).GetProperty(collectionFieldName);
            object curCollection = collectionProp.GetValue(_entity);
            object item = null;
            if (index < 0)
            {
                if (_filter.Body is MethodCallExpression callExpr && IsAnyMethod(callExpr.Method))
                {
                    if (callExpr.Arguments[0] is MemberExpression memberExpr
                        && memberExpr.Member.Name == collectionFieldName)
                    {
                        var predicate = (LambdaExpression) callExpr.Arguments[1];
                        Type itemType = predicate.Parameters[0].Type;
                        MethodInfo firstOrDefault = GetFirstOrDefaultMethod(itemType);
                        item = firstOrDefault.Invoke(null, new object[] { curCollection, predicate.Compile() });
                    }
                }
            }
            else
            {
                item = ((IEnumerable) curCollection).Cast<object>().ElementAt(index);
            }

            if (item != null)
            {
                PropertyInfo prop = item.GetType().GetProperty(fieldName);
                prop.SetValue(item, value);
            }
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(string fieldName, TField value)
        {
            if (_isInsert)
                Set(fieldName, value);
            return this;
        }

        public IUpdateBuilder<T> Unset(string fieldName)
        {
            PropertyInfo prop = typeof(T).GetProperty(fieldName);
            object value = null;
            if (prop.PropertyType.IsValueType)
                value = Activator.CreateInstance(prop.PropertyType);
            prop.SetValue(_entity, value);
            return this;
        }

        public IUpdateBuilder<T> Inc(string fieldName, int value)
        {
            PropertyInfo prop = typeof(T).GetProperty(fieldName);
            var curValue = (int) prop.GetValue(_entity);
            curValue += value;
            prop.SetValue(_entity, curValue);
            return this;
        }

        public IUpdateBuilder<T> RemoveAll<TItem>(string fieldName, Expression<Func<TItem, bool>> predicate)
        {
            PropertyInfo prop = typeof(T).GetProperty(fieldName);
            var curCollection = (IEnumerable<TItem>) prop.GetValue(_entity);
            TItem[] toRemove = curCollection.Where(predicate.Compile()).ToArray();
            MethodInfo removeMethod = curCollection.GetType().GetMethod("Remove");
            foreach (TItem item in toRemove)
                removeMethod.Invoke(curCollection, new object[] { item });
            return this;
        }

        public IUpdateBuilder<T> Add<TItem>(string fieldName, TItem value)
        {
            PropertyInfo prop = typeof(T).GetProperty(fieldName);
            object curCollection = prop.GetValue(_entity);
            MethodInfo addMethod = curCollection.GetType().GetMethod("Add");
            addMethod.Invoke(curCollection, new object[] { value });
            return this;
        }

        private static bool IsAnyMethod(MethodInfo mi)
        {
            return mi.DeclaringType == typeof(Enumerable) && mi.Name == "Any";
        }

        private static MethodInfo GetFirstOrDefaultMethod(Type type)
        {
            return typeof(Enumerable).GetMethods().Where(m => m.Name == "FirstOrDefault")
                .Single(m => m.GetParameters().Length == 2).MakeGenericMethod(type);
        }
    }
}
