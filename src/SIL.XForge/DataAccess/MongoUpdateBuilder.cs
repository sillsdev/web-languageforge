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

        public IUpdateBuilder<T> Set<TField>(string fieldName, TField value)
        {
            _defs.Add(_builder.Set(fieldName, value));
            return this;
        }

        public IUpdateBuilder<T> Set<TField>(string collectionFieldName, string fieldName, TField value,
            int index = -1)
        {
            string indexStr = index == -1 ? "$" : index.ToString();
            _defs.Add(_builder.Set($"{collectionFieldName}.{indexStr}.{fieldName}", value));
            return this;
        }

        public IUpdateBuilder<T> SetOnInsert<TField>(string fieldName, TField value)
        {
            _defs.Add(_builder.SetOnInsert(fieldName, value));
            return this;
        }

        public IUpdateBuilder<T> Unset(string fieldName)
        {
            _defs.Add(_builder.Unset(fieldName));
            return this;
        }

        public IUpdateBuilder<T> Inc(string fieldName, int value)
        {
            _defs.Add(_builder.Inc(fieldName, value));
            return this;
        }


        public IUpdateBuilder<T> RemoveAll<TItem>(string fieldName, Expression<Func<TItem, bool>> predicate)
        {
            _defs.Add(_builder.PullFilter(fieldName, Builders<TItem>.Filter.Where(predicate)));
            return this;
        }

        public IUpdateBuilder<T> Add<TItem>(string fieldName, TItem value)
        {
            _defs.Add(_builder.Push(fieldName, value));
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
