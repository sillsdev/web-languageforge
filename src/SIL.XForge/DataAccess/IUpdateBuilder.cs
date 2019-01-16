using System;
using System.Linq.Expressions;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public interface IUpdateBuilder<T> where T : Entity
    {
        IUpdateBuilder<T> Set<TField>(string fieldName, TField value);
        IUpdateBuilder<T> Set<TField>(string collectionFieldName, string fieldName, TField value,
            int index = -1);

        IUpdateBuilder<T> SetDictionaryValue<TField>(string dictionaryFieldName, string key, TField value);
        IUpdateBuilder<T> RemoveDictionaryValue(string dictionaryFieldName, string key);

        IUpdateBuilder<T> SetOnInsert<TField>(string fieldName, TField value);

        IUpdateBuilder<T> Unset(string fieldName);

        IUpdateBuilder<T> Inc(string fieldName, int value);

        IUpdateBuilder<T> RemoveAll<TItem>(string fieldName, Expression<Func<TItem, bool>> predicate);

        IUpdateBuilder<T> Add<TItem>(string fieldName, TItem value);
    }
}
