using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using MongoDB.Driver;
using SIL.XForge.Models;

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
            _defs.Add(_builder.Set(ToFieldDefinition(field), value));
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _defs.Add(_builder.SetOnInsert(ToFieldDefinition(field), value));
            return this;
        }

        public IUpdateBuilder<T> Unset<TField>(Expression<Func<T, TField>> field)
        {
            _defs.Add(_builder.Unset(ToFieldDefinition(field)));
            return this;
        }

        public IUpdateBuilder<T> Inc(Expression<Func<T, int>> field, int value)
        {
            _defs.Add(_builder.Inc(ToFieldDefinition(field), value));
            return this;
        }

        public IUpdateBuilder<T> RemoveAll<TItem>(Expression<Func<T, IEnumerable<TItem>>> field,
            Expression<Func<TItem, bool>> predicate)
        {
            _defs.Add(_builder.PullFilter(ToFieldDefinition(field), Builders<TItem>.Filter.Where(predicate)));
            return this;
        }

        public IUpdateBuilder<T> Add<TItem>(Expression<Func<T, IEnumerable<TItem>>> field, TItem value)
        {
            _defs.Add(_builder.Push(ToFieldDefinition(field), value));
            return this;
        }

        public UpdateDefinition<T> Build()
        {
            if (_defs.Count == 1)
                return _defs.Single();
            return _builder.Combine(_defs);
        }

        private static FieldDefinition<T, TField> ToFieldDefinition<TField>(Expression<Func<T, TField>> field)
        {
            return new XFFieldDefinition<T, TField>(field);
        }
    }
}
