using System.Collections.Generic;
using JsonApiDotNetCore.Builders;
using JsonApiDotNetCore.Internal;
using JsonApiDotNetCore.Models;
using JsonApiDotNetCore.Services;

namespace SIL.XForge.Services
{
    /// <summary>
    /// This class modifies the results of the default implementation in JsonApiDotNetCore.
    ///
    /// It has been modified to use the XFRelationshipData class, so that the JsonApiContractResolver can determine if
    /// the data is from a has-one relationship.
    /// </summary>
    public class XFDocumentBuilder : IDocumentBuilder
    {
        private readonly DocumentBuilder _internalBuilder;
        private readonly IResourceGraph _resourceGraph;

        public XFDocumentBuilder(
            IJsonApiContext jsonApiContext,
            IRequestMeta requestMeta = null,
            IDocumentBuilderOptionsProvider documentBuilderOptionsProvider = null,
            IScopedServiceProvider scopedServiceProvider = null)
        {
            _internalBuilder = new DocumentBuilder(jsonApiContext, requestMeta, documentBuilderOptionsProvider,
                scopedServiceProvider);
            _resourceGraph = jsonApiContext.ResourceGraph;
        }

        public Document Build(IIdentifiable entity)
        {
            Document doc = _internalBuilder.Build(entity);
            UpdateResourceObject(doc.Data);
            UpdateResourceObjects(doc.Included);
            return doc;
        }

        public Documents Build(IEnumerable<IIdentifiable> entities)
        {
            Documents docs = _internalBuilder.Build(entities);
            UpdateResourceObjects(docs.Data);
            UpdateResourceObjects(docs.Included);
            return docs;
        }

        public ResourceObject GetData(ContextEntity contextEntity, IIdentifiable entity)
        {
            return GetData(contextEntity, entity, null);
        }

        public ResourceObject GetData(ContextEntity contextEntity, IIdentifiable entity,
            IResourceDefinition resourceDefinition = null)
        {
            ResourceObject resourceObj = _internalBuilder.GetData(contextEntity, entity, resourceDefinition);
            UpdateResourceObject(resourceObj);
            return resourceObj;
        }

        private void UpdateResourceObjects(IList<ResourceObject> resourceObjs)
        {
            if (resourceObjs == null)
                return;

            foreach (ResourceObject resourceObj in resourceObjs)
                UpdateResourceObject(resourceObj);
        }

        private void UpdateResourceObject(ResourceObject resourceObj)
        {
            if (resourceObj == null || resourceObj.Relationships == null)
                return;

            ContextEntity contextEntity = _resourceGraph.GetContextEntity(resourceObj.Type);
            foreach (RelationshipAttribute relationship in contextEntity.Relationships)
            {
                RelationshipData oldData = resourceObj.Relationships[relationship.PublicRelationshipName];
                var newData = new XFRelationshipData
                {
                    IsHasOne = relationship.IsHasOne,
                    Links = oldData.Links,
                    SingleData = oldData.SingleData,
                    ManyData = oldData.ManyData
                };
                resourceObj.Relationships[relationship.PublicRelationshipName] = newData;
            }
        }
    }
}
