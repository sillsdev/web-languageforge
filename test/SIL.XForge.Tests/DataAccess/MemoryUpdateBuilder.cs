using System;
using System.Linq.Expressions;
using System.Reflection;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public class MemoryUpdateBuilder<T> : IUpdateBuilder<T> where T : Entity, new()
    {
        private readonly T _entity;
        private readonly bool _isInsert;

        public MemoryUpdateBuilder(T entity, bool isInsert)
        {
            _entity = entity;
            _isInsert = isInsert;
        }

        public IUpdateBuilder<T> Set<TField>(Expression<Func<T, TField>> field, TField value)
        {
            return Set(GetPropertyName(field), value);
        }

        public IUpdateBuilder<T> Set<TField>(string fieldName, TField value)
        {
            PropertyInfo prop = GetProperty(fieldName);
            prop.SetValue(_entity, value);
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(Expression<Func<T, TField>> field, TField value)
        {
            if (_isInsert)
                Set(field, value);
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(string fieldName, TField value)
        {
            if (_isInsert)
                Set(fieldName, value);
            return this;
        }

        public IUpdateBuilder<T> Unset(Expression<Func<T, object>> field)
        {
            return Unset(GetPropertyName(field));
        }

        public IUpdateBuilder<T> Unset(string fieldName)
        {
            PropertyInfo prop = GetProperty(fieldName);
            object value = null;
            if (prop.PropertyType.IsValueType)
                value = Activator.CreateInstance(prop.PropertyType);
            prop.SetValue(_entity, value);
            return this;
        }

        public IUpdateBuilder<T> Inc(Expression<Func<T, int>> field, int value)
        {
            return Inc(GetPropertyName(field), value);
        }

        public IUpdateBuilder<T> Inc(string fieldName, int value)
        {
            PropertyInfo prop = GetProperty(fieldName);
            var curValue = (int) prop.GetValue(_entity);
            curValue += value;
            prop.SetValue(_entity, curValue);
            return this;
        }

        private string GetPropertyName<TField>(Expression<Func<T, TField>> field)
        {
            var body = (MemberExpression) field.Body;
            return body.Member.Name;
        }

        private PropertyInfo GetProperty(string fieldName)
        {
            return typeof(T).GetProperty(fieldName);
        }
    }
}
