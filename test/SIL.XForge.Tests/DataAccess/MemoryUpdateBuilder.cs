using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using SIL.XForge.Models;
using SIL.XForge.Utils;

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

        public IUpdateBuilder<T> Set<TField>(Expression<Func<T, TField>> field, TField value)
        {
            (object owner, PropertyInfo propInfo) = GetFieldOwner(field);
            propInfo.SetValue(owner, value);
            return this;
        }

        public IUpdateBuilder<T> SetDictionaryValue<TItem>(
            Expression<Func<T, IDictionary<string, TItem>>> dictionaryField, string key, TItem value)
        {
            Func<T, IDictionary<string, TItem>> getDictionary = dictionaryField.Compile();
            IDictionary<string, TItem> dictionary = getDictionary(_entity);
            dictionary[key] = value;
            return this;
        }

        public IUpdateBuilder<T> RemoveDictionaryValue<TItem>(
            Expression<Func<T, IDictionary<string, TItem>>> dictionaryField, string key)
        {
            Func<T, IDictionary<string, TItem>> getDictionary = dictionaryField.Compile();
            IDictionary<string, TItem> dictionary = getDictionary(_entity);
            dictionary.Remove(key);
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(Expression<Func<T, TField>> field, TField value)
        {
            if (_isInsert)
                Set(field, value);
            return this;
        }

        public IUpdateBuilder<T> Unset<TField>(Expression<Func<T, TField>> field)
        {
            (object owner, PropertyInfo prop) = GetFieldOwner(field);
            object value = null;
            if (prop.PropertyType.IsValueType)
                value = Activator.CreateInstance(prop.PropertyType);
            prop.SetValue(owner, value);
            return this;
        }

        public IUpdateBuilder<T> Inc(Expression<Func<T, int>> field, int value)
        {
            (object owner, PropertyInfo prop) = GetFieldOwner(field);
            var curValue = (int)prop.GetValue(owner);
            curValue += value;
            prop.SetValue(owner, curValue);
            return this;
        }

        public IUpdateBuilder<T> RemoveAll<TItem>(Expression<Func<T, IEnumerable<TItem>>> field,
            Expression<Func<TItem, bool>> predicate)
        {
            Func<T, IEnumerable<TItem>> getCollection = field.Compile();
            IEnumerable<TItem> collection = getCollection(_entity);
            TItem[] toRemove = collection.Where(predicate.Compile()).ToArray();
            MethodInfo removeMethod = collection.GetType().GetMethod("Remove");
            foreach (TItem item in toRemove)
                removeMethod.Invoke(collection, new object[] { item });
            return this;
        }

        public IUpdateBuilder<T> Add<TItem>(Expression<Func<T, IEnumerable<TItem>>> field, TItem value)
        {
            Func<T, IEnumerable<TItem>> getCollection = field.Compile();
            IEnumerable<TItem> collection = getCollection(_entity);
            MethodInfo addMethod = collection.GetType().GetMethod("Add");
            addMethod.Invoke(collection, new object[] { value });
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

        private (object Owner, PropertyInfo Property) GetFieldOwner<TField>(Expression<Func<T, TField>> field)
        {
            object owner = null;
            MemberInfo member = null;
            int index = int.MinValue;
            foreach (Expression node in ExpressionHelper.Flatten(field))
            {
                if (owner == null)
                {
                    owner = _entity;
                }
                else
                {
                    switch (member)
                    {
                        case MethodInfo method:
                            if (index < 0)
                            {
                                if (_filter.Body is MethodCallExpression callExpr && IsAnyMethod(callExpr.Method))
                                {
                                    var predicate = (LambdaExpression)callExpr.Arguments[1];
                                    Type itemType = predicate.Parameters[0].Type;
                                    MethodInfo firstOrDefault = GetFirstOrDefaultMethod(itemType);
                                    owner = firstOrDefault.Invoke(null,
                                        new object[] { owner, predicate.Compile() });
                                }
                            }
                            else
                            {
                                owner = method.Invoke(owner, new object[] { index });
                            }
                            break;

                        case PropertyInfo prop:
                            owner = prop.GetValue(owner);
                            break;
                    }
                }

                switch (node)
                {
                    case MemberExpression memberExpr:
                        member = memberExpr.Member;
                        index = int.MinValue;
                        break;

                    case MethodCallExpression methodExpr:
                        member = methodExpr.Method;
                        if (member.Name != "get_Item")
                            throw new ArgumentException("Invalid method call in field expression.", nameof(field));
                        var constant = (ConstantExpression)methodExpr.Arguments[0];
                        index = (int)constant.Value;
                        break;
                }
            }
            return (owner, (PropertyInfo)member);
        }
    }
}
