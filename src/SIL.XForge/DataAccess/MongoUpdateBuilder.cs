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
            _defs.Add(_builder.Set(field, value));
            return this;
        }

        public IUpdateBuilder<T> Set<TField>(string fieldName, TField value)
        {
            _defs.Add(_builder.Set(fieldName, value));
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(Expression<Func<T, TField>> field, TField value)
        {
            _defs.Add(_builder.SetOnInsert(field, value));
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(string fieldName, TField value)
        {
            _defs.Add(_builder.SetOnInsert(fieldName, value));
            return this;
        }

        public IUpdateBuilder<T> Unset(Expression<Func<T, object>> field)
        {
            _defs.Add(_builder.Unset(field));
            return this;
        }

        public IUpdateBuilder<T> Unset(string fieldName)
        {
            _defs.Add(_builder.Unset(fieldName));
            return this;
        }

        public IUpdateBuilder<T> Inc(Expression<Func<T, int>> field, int value)
        {
            _defs.Add(_builder.Inc(field, value));
            return this;
        }

        public IUpdateBuilder<T> Inc(string fieldName, int value)
        {
            _defs.Add(_builder.Inc(fieldName, value));
            return this;
        }

        public UpdateDefinition<T> Build()
        {
            if (_defs.Count == 1)
                return _defs.Single();
            return _builder.Combine(_defs);
        }
    }
}
