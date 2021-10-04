<?php

/*
 * Note: \MongoDB is the new PHP MongoDB driver (as opposed to the legacy \Mongo) and is essentially two pieces:
 * 1) the \MongoDB\Driver which is installable through PECL (mongodb v1.6)
 * 2) the \MongoDB\Client client library which is installable through Composer (mongodb/mongodb : ^1.0.0)
 *
 * Useful web references for the \MongoDB class and friends
 * PHP MongoDB Driver API Reference (php.net)          http://php.net/manual/en/set.mongodb.php
 * PHP MongoDB Client Library API Generated Docs       http://mongodb.github.io/mongo-php-library/api/
 * PHP MongoDB Client Library API Reference            http://mongodb.github.io/mongo-php-library/
 * MongoDB Documentation                               https://docs.mongodb.org/manual/reference/
 *
 */

namespace Api\Model\Shared\Mapper;

use MongoDB\UpdateResult;
use Palaso\Utilities\CodeGuard;

class MongoMapper
{
    const ID_IN_KEY = 0;
    const ID_IN_DOC = 1;

    /**
     * @param string $databaseName
     * @param string $collectionName
     * @param string $idKey defaults to id
     */
    public function __construct($databaseName, $collectionName, $idKey = 'id')
    {
        $this->_db = MongoStore::connect($databaseName);
        $this->_collection = $this->_db->selectCollection($collectionName);
        $this->_idKey = $idKey;
    }

    /** @var \MongoDB\Database */
    protected $_db;

    /** @var \MongoDB\Collection */
    protected $_collection;

    /** @var string */
    private $_idKey;

    /**
     * Private clone to prevent copies of the singleton.
     */
    private function __clone()
    {
    }

    /**
     * Creates a string suitable for use as a key from the given string $s
     * @param string $s
     * @return string
     */
    public static function makeKey($s)
    {
        $s = str_replace(array(' ', '-', '_'), '', $s);
        return $s;
    }

    /**
     * @return string
     */
    public static function makeId()
    {
        /** @noinspection PhpParamsInspection */
        $id = new \MongoDB\BSON\ObjectID();
        return (string) $id;
    }

    /**
     * Returns the name of the database.
     * @return string
     */
    public function databaseName()
    {
        return (string) $this->_db;
    }

    public static function mongoID($id = '')
    {
        CodeGuard::checkTypeAndThrow($id, 'string');
        if (!empty($id)) {
            return new \MongoDB\BSON\ObjectID($id);
        }
        /** @noinspection PhpParamsInspection */
        return new \MongoDB\BSON\ObjectID();
    }

    /**
     * @param $model
     * @param string $query - Mongo selection query
     * @param array $fields - fields to return (projection)
     * @param array $sortFields
     * @param int $limit
     * @param int $skip
     * @throws \Exception
     */
    public function readListAsModels($model, $query, $fields = array(), $sortFields = array(), $limit = 0, $skip = 0)
    {
        $options = array('projection' => $fields);

        if (count($sortFields)>0) {
            $options['sort'] = $sortFields;
        }
        if ($limit>0) {
            $options['limit'] = $limit;
        }
        if ($skip > 0) {
            $options['skip'] = $skip;
        }
        $cursor = $this->_collection->find($query, $options);

        $data = array();
        $data['totalCount'] = $this->_collection->count($query);
        $data['entries'] = array();
        $ctr = 0;
        foreach ($cursor as $item) {
            if (get_class($model->entries) == 'Api\Model\Shared\Mapper\ArrayOf') {
                $item['id'] = (string) $item['_id'];
                $data['entries'][] = $item;
            } else {
                $data['entries'][(string) $item['_id']] = $item;
            }
            $ctr++;
        }
        $data['count'] = $ctr;
        try {
            MongoDecoder::decode($model, $data);
        } catch (\Exception $ex) {
            CodeGuard::exception('Exception thrown in readListAsModels.  Note: use of this method assumes that you have redefined $this->entries to be of type MapOf or ArrayOf.  Exception thrown while decoding \'' . print_r($data, true) . "'", $ex->getCode(), $ex);
        }

    }

    public function readList($model, $query, $fields = array(), $sortFields = array(), $limit = 0, $skip = 0)
    {
        $projection = array();
        foreach ($fields as $field) {
            $projection[$field] = true;
        }
        $options = array('projection' => $projection);

        if (count($sortFields)>0) {
            $options['sort'] = $sortFields;
        }
        if ($limit>0) {
            $options['limit'] = $limit;
        }
        if ($skip > 0) {
            $options['skip'] = $skip;
        }
        $cursor = $this->_collection->find($query, $options);

        $model->totalCount = $this->_collection->count($query);

        $model->entries = array();
        $ctr = 0;
        foreach ($cursor as $item) {
            $id = strval($item['_id']);
            $item[$this->_idKey] = $id;
            unset($item['_id']);
            $model->entries[] = $item;
            $ctr++;
        }
        $model->count = $ctr;
    }

    public function readCounts($model, $query, $fields = array(), $sortFields = array(), $limit = 0, $skip = 0)
    {
        $options = array('projection' => $fields);

        if (count($sortFields)>0) {
            $options['sort'] = $sortFields;
        }
        if ($limit>0) {
            $options['limit'] = $limit;
        }
        if ($skip > 0) {
            $options['skip'] = $skip;
        }

        $model->totalCount = $this->_collection->count($query);
        $model->count = $this->_collection->count($query, $options);
        $model->entries = array();
    }

    public function findOneByQuery($model, $query, $fields = array())
    {
        $options = array('projection' => $fields);
        $data = $this->_collection->findOne($query, $options);
        if ($data === NULL) {
            return;
        }
        try {
            MongoDecoder::decode($model, $data, (string) $data['_id']);
        } catch (\Exception $ex) {
            throw new \Exception("Exception thrown while reading", $ex->getCode(), $ex);
        }
    }

    /**
     * @param string $id
     * @return bool
     */
    public function exists($id)
    {
        CodeGuard::checkTypeAndThrow($id, 'string');
        try {
            $data = $this->_collection->findOne(array("_id" => self::mongoID($id)));
            if ($data != NULL) {
                return true;
            }
        } catch (\Exception $e) { }
        return false;
    }

    /**
     * @param mixed $model
     * @param string $id
     * @throws \Exception
     */
    public function read($model, $id)
    {
        CodeGuard::checkTypeAndThrow($id, 'string');
        $data = $this->_collection->findOne(array("_id" => self::mongoID($id)));
        if ($data === NULL) {
            $collection = (string) $this->_collection;
            throw new \Exception("Could not find id '$id' in '$collection'");
        }
        try {
            MongoDecoder::decode($model, $data, $id);
        } catch (\Exception $ex) {
            CodeGuard::exception("Exception thrown while decoding " . get_class($model) . "('$id')", $ex->getCode(), $ex);
        }
    }

    /**
     * @param mixed $model
     * @param string $property
     * @param string $value
     * @return bool true on document found, false otherwise
     * Note that unlike the read() method, readByProperty() does NOT throw an exception if no document is found
     *
     */
    public function readByProperty($model, $property, $value)
    {
        CodeGuard::checkTypeAndThrow($property, 'string');
        CodeGuard::checkTypeAndThrow($value, 'string');
        $data = $this->_collection->findOne(array($property => $value));
        if ($data != NULL) {
            MongoDecoder::decode($model, $data, (string) $data['_id']);
            return true;
        }
        return false;
    }

    /**
     * @param mixed $model
     * @param array  $properties
     * @return bool
     */
    public function readByProperties($model, $properties)
    {
        CodeGuard::checkTypeAndThrow($properties, 'array');
        $data = $this->_collection->findOne($properties);
        if ($data != NULL) {
            MongoDecoder::decode($model, $data, (string) $data['_id']);
            return true;
        }
        return false;
    }

    public function readByPropertyArrayContains($model, $property, $value)
    {
        CodeGuard::checkTypeAndThrow($value, 'string');
        $data = $this->_collection->findOne([$property => $value]);  // Yes, it's that simple
        if ($data != NULL) {
            MongoDecoder::decode($model, $data, (string) $data['_id']);
            return true;
        }
        return false;
    }

    public function readSubDocument($model, $rootId, $property, $id)
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        $data = $this->_collection->findOne(array("_id" => self::mongoID($rootId)), array('projection' => $property . '.' . $id));
        if ($data === NULL) {
            throw new \Exception("Could not find $property=$id in $rootId");
        }
        // TODO Check this out on nested sub docs > 1
        $data = $data[$property][$id];
        MongoDecoder::decode($model, $data, $id);
    }

    /**
     * @param object $model
     * @param string $id
     * @param int $keyStyle
     * @param string $rootId
     * @param string $property
     * @see ID_IN_KEY
     * @see ID_IN_DOC
     * @return string
     * @throws \Exception
     */
    public function write($model, $id, $rearrangeableProperties = [], $rearrangeableSubproperties = [], $keyStyle = MongoMapper::ID_IN_KEY, $rootId = '', $property = '')
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($property, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        $data = MongoEncoder::encode($model); // TODO Take into account key style for stripping key out of the model if needs be
        if (empty($rootId)) {
            // We're doing a root level update, only $model, $id are relevant
            $this->rearrangeIfNeeded($data, $id, $rearrangeableProperties, $rearrangeableSubproperties);
            $id = $this->update($data, $id, self::ID_IN_KEY, '', '');
        } else {
            if ($keyStyle == self::ID_IN_KEY) {
                CodeGuard::checkNullAndThrow($id, 'id');
                $this->rearrangeIfNeeded($model, $id, $rearrangeableProperties, $rearrangeableSubproperties);
                $id = $this->update($data, $id, self::ID_IN_KEY, $rootId, $property);
            } else {
                if (empty($id)) {
                    // TODO would be nice if the encode above gave us the id it generated so we could return it to be consistent. CP 2013-08
                    throw new \Exception("Method appendSubDocument() is not implemented");
                    //$this->appendSubDocument($data, $rootId, $property);
                } else {
                    $this->rearrangeIfNeeded($model, $id, $rearrangeableProperties, $rearrangeableSubproperties);
                    $id = $this->update($data, $id, self::ID_IN_DOC, $rootId, $property);
                }
            }
        }
        return $id;
    }

    public function remove($id)
    {
        CodeGuard::checkTypeAndThrow($id, 'string');
        $result = $this->_collection->deleteOne(array('_id' => self::mongoID($id)));
        return $result->getDeletedCount();
    }

    public function dropCollection() {
        $this->_collection->drop();
    }

    public function getCollectionName() {
        return $this->_collection->getCollectionName();
    }

    public function removeSubDocument($rootId, $property, $id)
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        $filter = array('_id' => self::mongoID($rootId));
        $updateCommand = array('$unset' => array($property . '.' . $id => ''));
        $result = $this->_collection->updateOne($filter, $updateCommand);
        return $result->getModifiedCount();
    }

    public function removeProperty($property)
    {
        CodeGuard::checkTypeAndThrow($property, 'string');
        $filter = array($property => array('$exists' => true));
        $updateCommand = array('$unset' => array($property => true));
        $result = $this->_collection->updateMany($filter, $updateCommand);
        return $result->getModifiedCount();
    }

    /**
     * @param string|ObjectID $id
     * @param object $diff
     * @return null
     * @throws \Exception
     */
    public function writeDiff($id, $diff)
    {
        if (is_string($id)) $id = self::mongoID($id);
        $filter = array('_id' => $id);
        $this->_collection->updateOne($filter, $diff);
    }

    /**
     * Since MongoEncoder::encode returns new \stdClass() instead of an empty array, but empty(new \stdClass()) returns false, we need a different way to detect if an encoded object is empty.
     * See https://stackoverflow.com/questions/9412126/how-to-check-that-an-object-is-empty-in-php
     */
    public static function objectIsEmpty($object) {
        if (is_null($object)) return true;
        foreach ($object as $key) {
            return false;
        }
        return true;
    }

    public static function shouldPersist($value) {
        if (is_null($value))
            return false;
        if (is_bool($value))
            return true;
        if (empty($value))
            return false;
        if (is_object($value) && self::objectIsEmpty($value))
            return false;
        return true;
    }

    public static function shouldKeepKey(string $key) {
        // Some keys shouldn't be removed even if empty, at least as long as our code is still making assumptions that these keys exist
        // TODO: Transfer this knowledge to the ObjectForEncoding base class, so that it can pass down a list of keys to keep on a per-model basis. That will avoid this hardcoded list.
        return ($key === "guid" || $key === "translation" || $key === "description" || $key === "answers" || $key == "paragraphs");
    }

    public static function removeEmptyItems(array $array) {
        foreach ($array as $key => &$value) {
            if (is_array($value)) {
                $value = self::removeEmptyItems($value);
            }
            if (self::shouldPersist($value) || self::shouldKeepKey($key)) {
                $array[$key] = $value;
            } else {
                unset($array[$key]);
            }
        }
        return $array;
    }

    protected function prepareUpdateCommand($data) {
        // Returns two arrays: keysToSet and keysToUnset (both with key => value)
        $keysToSet = [];
        $keysToUnset = [];
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $value = self::removeEmptyItems($value);
            }
            if (self::shouldPersist($value) || self::shouldKeepKey($key)) {
                $keysToSet[$key] = $value;
            } else {
                $keysToUnset[$key] = null;
            }
        }
        return [$keysToSet, $keysToUnset];
    }

    /**
     * @param array $data
     * @param string $id
     * @param int $keyType
     * @param string $rootId
     * @param string $property
     * @return string
     */
    protected function update($data, $id, $keyType, $rootId, $property)
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        if ($keyType == self::ID_IN_KEY) {
            if (empty($rootId)) {
                $mongoid = self::mongoID($id);
                $filter = array('_id' => $mongoid);
                list($keysToSet, $keysToUnset) = $this->prepareUpdateCommand($data);
                $updateCommand = array('$set' => $keysToSet);
                if (! empty($keysToUnset)) {
                    $updateCommand['$unset'] = $keysToUnset;
                }
                $options = array('upsert' => true);
                $this->_collection->updateOne($filter, $updateCommand, $options);
                $id = $mongoid->__toString();
            } else {
                CodeGuard::checkNullAndThrow($id, 'id');
                CodeGuard::checkNullAndThrow($property, 'property');
                $subKey = $property . '.' . $id;
                $filter = array('_id' => self::mongoID($rootId));
                $updateCommand = array('$set' => array($subKey => $data));
                $this->_collection->updateOne($filter, $updateCommand);
            }
        } else {
            CodeGuard::checkNullAndThrow($id, 'id');
            $filter = array('_id' => self::mongoID($rootId));
            $updateCommand = array('$set' => array($property . '$' . $id => $data));
            $this->_collection->updateOne($filter, $updateCommand);
        }
        return $id;
    }

    protected function rearrangeIfNeeded($data, $id, $rearrangeableProperties = [], $rearrangeableSubproperties = [])
    {
        if (empty($rearrangeableProperties) && empty($rearrangeableSubproperties)) {
            // Most models don't need this, so exit early in most scenarios
            return;
        }

        $filter = ['_id' => self::mongoID($id)];
        $oldMongoData = $this->_collection->find($filter)->toArray();

        foreach ($rearrangeableProperties as $property) {
            if (!array_key_exists($property, $data)) {
                // No rearranging needed if we're deleting the entire property
                continue;
            }
            if (!array_key_exists($property, $oldMongoData)) {
                // No rearranging needed if the property didn't exist before
                continue;
            }
            $this->rearrangeOne($oldMongoData, $data, $id, $property);
        }

        // Re-read data now that first-level property arrays have been rearranged, so that indices will match up when rearranging subproperties
        $oldMongoData = $this->_collection->find($filter)->toArray();

        foreach ($rearrangeableSubproperties as $property => $subProperties) {
            foreach ($data[$property] as $index => $propData) {
                foreach ($subProperties as $subProperty) {
                    if (!array_key_exists($subProperty, $propData)) {
                        // No rearranging needed if we're deleting the entire property
                        continue;
                    }
                    if (!array_key_exists($property, $oldMongoData) || empty($oldMongoData[$property] || empty($oldMongoData[$property][$index]))) {
                        // No need to rearrange an empty array
                        continue;
                    } else {
                        // We can now count on the indices matching up
                        $oldPropData = $oldMongoData[$property][$index];
                    }
                    if (!array_key_exists($subProperty, $oldPropData)) {
                        // No rearranging needed if the property didn't exist before
                        continue;
                    }
                    $this->rearrangeOne($oldPropData, $propData, $id, $property, $index, $subProperty);
                }
            }
        }
    }

    protected function rearrangeOne($oldData, $newData, $rootId, $property, $subIndex = 0, $subProperty = '', $idFieldName = 'guid')
    {
        // First get the old data
        $filter = ['_id' => self::mongoID($rootId)];
        if (empty($subProperty)) {
            // Property rearranging: data is entire object.
            $newItems = $newData[$property];
            $oldItems = $oldData[$property];
        } else {
            // Subproperty rearranging: data is one item in the root property
            // E.g., if $property = 'senses' and $subProperty = 'examples', then data is *one* sense, not the whole array of senses
            $newItems = $newData[$subProperty];
            $oldItems = $oldData[$subProperty];
        }
        $oldGuids = [];
        foreach ($oldItems as $item) {
            $oldGuids[] = $item[$idFieldName];
        }
        $newGuids = [];
        $newItemsByGuid = [];
        foreach ($newItems as $item) {
            $newGuids[] = $item[$idFieldName];
            $newItemsByGuid[$item[$idFieldName]] = $item;
        }
        $changes = MapperUtils::calculateChanges($oldGuids, $newGuids);
        if (empty($changes)) {
            return; // Nothing to do!
        }
        $dataToAdd = [];
        foreach ($changes['added'] as $changeGuid) {
            $dataToAdd[] = $newItemsByGuid[$changeGuid];
        }
        $this->addAndRemoveInProperty($dataToAdd, $changes['removed'], $rootId, $property, $subIndex, $subProperty, $idFieldName);
        $this->reorderInPseudoTransaction($filter, $changes['moved'], $property, $subIndex, $subProperty);
    }

    /**
     * @param array $dataToAdd - An array of "objects" to add (if you're only adding one item, call as [$itemToAdd])
     * @param string[] $guidsToRemove
     * @param string $rootId
     * @param string $property
     * @return string
     */
    protected function addAndRemoveInProperty($dataToAdd, $guidsToRemove, $rootId, $property, $subIndex = 0, $subProperty = '', $idFieldName = 'guid') {
        // Besides the update() parameters, we also need to take one more: the order mapping.
        // This will be an array from old to new: [0 => 1, 1 => 2, 2 => 0] means to rearrange ABC into CAB.

        // This needs to handle two cases:
        // 1. "senses", where it's a property of the root object and we're replacing that property
        // 2. "senses.examples", where it's a sub-property and the property we're replacing is something like "senses.0.examples"
        // This should probably build the update, but the root one does the update.
        $filter = ['_id' => self::mongoID($rootId)];
        if (empty($subProperty)) {
            $key = $property;
        } else {
            $key = $property . '.' . $subIndex . '.' . $subProperty;
        }
        $removeUpdateCommand = $this->createRemoveUpdate($key, $guidsToRemove, $idFieldName);
        $addUpdateCommand = $this->createAddUpdate($key, $dataToAdd);
        $this->_collection->updateOne($filter, $removeUpdateCommand);
        $this->_collection->updateOne($filter, $addUpdateCommand);
    }

    protected function createRemoveUpdate($key, $guidsToRemove, $idFieldName = 'guid')
    {
        // db.samples.update({'guid': '456'}, {'$pull': {'senses.0.examples': {'guid': {'$in': ['A1']}}}})
        return [
            '$pull' => [
                $key => [
                    $idFieldName => [
                        '$in' => $guidsToRemove
                    ]
                ]
            ]
        ];
    }

    /**
     * @param $key string The Mongo key to push items into (e.g., 'senses.0.examples')
     * @param $dataToAdd array (NOTE: Needs to be a *real* array, not a hashtable. PHP's type system can't distinguish these)
     * @return array
     */
    protected function createAddUpdate($key, $dataToAdd)
    {
        // E.g., db.collection.update({'guid': '456'}, {'$push': {'senses.0.examples': {'$each': [{'guid': 'A3', 'sentence': 'Ex-A3'}]}}})
        return [
            '$push' => [
                $key => [
                    '$each' => $dataToAdd
                ]
            ]
        ];
    }

    protected function reorderInPseudoTransaction($baseFilter, $orderMapping, $property, $subIndex = 0, $subProperty = '', $timeoutInSeconds = 0.5) {
        $startTime = microtime(true);
        $filter = $baseFilter;
        while (true) {
            $data = $this->_collection->find($baseFilter)->toArray();
            if (empty($data)) {
                return true;
            }
            if (empty($subProperty)) {
                $dataBeforeReordering = $data[$property];
                $key = $property;
            } else {
                $dataBeforeReordering = $data[$property][$subIndex][$subProperty];
                $key = $property . '.' . $subIndex . '.' . $subProperty;
            }
            $filter[$key] = $dataBeforeReordering;
            $reorderedData = $this->reorderData($orderMapping, $dataBeforeReordering);
            $update = [
                '$set' => [ $key => $reorderedData ]
            ];
            /** @var UpdateResult $result */
            $result = $this->_collection->updateOne($filter, $update);
            if ($result->isAcknowledged() && $result->getModifiedCount() > 0) {
                return true;
            }
            $now = microtime(true);
            if (($now - $startTime) > $timeoutInSeconds) {
                return false;
            }
        }
    }

    protected function reorderData($orderMapping, $data) {
        // Ensure that indices will be returned in order by pre-allocating the indices of the array
        $result = array_fill(0, count($orderMapping), null);

        foreach ($orderMapping as $oldIndex => $newIndex) {
            $result[$newIndex] = $data($oldIndex);
        }
        return $result;
    }
}
