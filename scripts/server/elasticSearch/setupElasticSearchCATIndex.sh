#!/bin/bash

echo Creates the ElasticSearch index and sets up its settings and data mappings.
echo Make sure you have an SSH tunnel open to \'es_401\'.
curl -XPUT "http://es_401:9200/cat_metrics_2" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "index.mapping.single_type": true
  },
  "mappings": {
    "cat_metric": {
      "properties": {
        "dateCreated": { "type": "date" },
        "dateModified": { "type": "date" },
        "documentSet": {
          "properties": {
            "id": { "type": "keyword" },
            "name": { "type": "text" }
          }
        },
        "isTestData": { "type": "boolean" },
        "metrics": {
          "properties": {
            "keyBackspaceCount": { "type": "integer" },
            "keyCharacterCount": { "type": "integer" },
            "keyDeleteCount": { "type": "integer" },
            "keyNavigationCount": { "type": "integer" },
            "mouseClickCount": { "type": "integer" },
            "productiveCharacterCount": { "type": "integer" },
            "suggestionAcceptedCount": { "type": "integer" },
            "suggestionTotalCount": { "type": "integer" },
            "timeEditActive": { "type": "long" },
            "timeTotal": { "type": "long" }
          }
        },
        "projectCode": { "type": "keyword" },
        "user": {
          "properties": {
            "id": { "type": "keyword" },
            "name": { "type": "text" }
          }
        },
        "version": { "type": "keyword" }
      }
    }
  }
}'
