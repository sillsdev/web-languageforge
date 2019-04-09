using System;
using System.Linq.Expressions;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;

public class XFFieldDefinition<TDocument, TField> : FieldDefinition<TDocument, TField>
{
    private readonly ExpressionFieldDefinition<TDocument, TField> _internalDef;

    public XFFieldDefinition(Expression<Func<TDocument, TField>> expression)
    {
        _internalDef = new ExpressionFieldDefinition<TDocument, TField>(expression);
    }

    public override RenderedFieldDefinition<TField> Render(IBsonSerializer<TDocument> documentSerializer,
        IBsonSerializerRegistry serializerRegistry)
    {
        RenderedFieldDefinition<TField> rendered = _internalDef.Render(documentSerializer, serializerRegistry);
        string fieldName = rendered.FieldName.Replace(ArrayPosition.All.ToString(), "$[]");
        if (fieldName != rendered.FieldName)
        {
            return new RenderedFieldDefinition<TField>(fieldName, rendered.FieldSerializer, rendered.ValueSerializer,
                rendered.UnderlyingSerializer);
        }
        return rendered;
    }
}
