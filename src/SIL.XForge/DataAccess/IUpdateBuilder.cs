using System;
using System.Linq.Expressions;
using SIL.XForge.Models;

namespace SIL.XForge.DataAccess
{
    public interface IUpdateBuilder<T> where T : Entity
    {
        IUpdateBuilder<T> Set<TField>(Expression<Func<T, TField>> field, TField value);
        IUpdateBuilder<T> Set<TField>(string fieldName, TField value);

        IUpdateBuilder<T> SetOnInsert<TField>(Expression<Func<T, TField>> field, TField value);
        IUpdateBuilder<T> SetOnInsert<TField>(string fieldName, TField value);

        IUpdateBuilder<T> Unset(Expression<Func<T, object>> field);
        IUpdateBuilder<T> Unset(string fieldName);

        IUpdateBuilder<T> Inc(Expression<Func<T, int>> field, int value);
        IUpdateBuilder<T> Inc(string fieldName, int value);
    }
}
