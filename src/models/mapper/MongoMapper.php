<?php

namespace models\mapper;

use Palaso\Utilities\CodeGuard;

class MongoMapper
{

    const ID_IN_KEY = 0;
    const ID_IN_DOC = 1;

    /**
     * @var MongoDB
     */
    protected $_db;

    /**
     * @var MongoCollection
     */
    protected $_collection;

    /**
     * @var string
     */
    private $_idKey;

    /**
     * @param string $database
     * @param string $collection
     * @param string $idKey defaults to id
     */
    public function __construct($database, $collection, $idKey = 'id')
    {
        $this->_db = MongoStore::connect($database);
        $this->_collection = $this->_db->$collection;
        $this->_idKey = $idKey;
    }

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
        $id = new \MongoId();
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
            return new \MongoId($id);
        }
        return new \MongoId();
    }

    public function readListAsModels($model, $query, $fields = array(), $sortFields = array(), $limit = 0, $skip = 0)
    {
        $cursor = $this->_collection->find($query, $fields);
        if (count($sortFields)>0) {
            $cursor = $cursor->sort($sortFields);
        }
        if ($limit>0) {
            $cursor = $cursor->limit($limit);
        }
        if ($skip > 0) {
            $cursor = $cursor->skip($skip);
        }

        $data = array();
        $data['count'] = $cursor->count(true);
        $data['totalCount'] = $cursor->count();
        $data['entries'] = array();
        foreach ($cursor as $item) {
            if (get_class($model->entries) == 'models\mapper\ArrayOf') {
                $item['id'] = (string) $item['_id'];
                $data['entries'][] = $item;
            } else {
                $data['entries'][(string) $item['_id']] = $item;
            }
        }
        try {
            MongoDecoder::decode($model, $data);
        } catch (\Exception $ex) {
            CodeGuard::exception('Exception thrown in readListAsModels.  Note: use of this method assumes that you have redefined $this->entries to be of type MapOf or ArrayOf.  Exception thrown while decoding \'' . print_r($data, true) . "'", $ex->getCode(), $ex);
        }

    }

    public function readList($model, $query, $fields = array(), $sortFields = array(), $limit = 0, $skip = 0)
    {
        $cursor = $this->_collection->find($query, $fields);

        if (count($sortFields)>0) {
            $cursor = $cursor->sort($sortFields);
        }

        if ($limit>0) {
            $cursor = $cursor->limit($limit);
        }

        if ($skip > 0) {
            $cursor = $cursor->skip($skip);
        }

        $model->count = $cursor->count(true);
        $model->totalCount = $cursor->count();

        $model->entries = array();
        foreach ($cursor as $item) {
            $id = strval($item['_id']);
            $item[$this->_idKey] = $id;
            unset($item['_id']);
            $model->entries[] = $item;
        }
    }

    public function readCounts($model, $query, $fields = array(), $sortFields = array(), $limit = 0, $skip = 0)
    {
        $cursor = $this->_collection->find($query, $fields);

        if (count($sortFields)>0) {
            $cursor = $cursor->sort($sortFields);
        }

        if ($limit>0) {
            $cursor = $cursor->limit($limit);
        }

        if ($skip > 0) {
            $cursor = $cursor->skip($skip);
        }

        $model->count = $cursor->count(true);
        $model->totalCount = $cursor->count();

        $model->entries = array();
    }

    public function findOneByQuery($model, $query, $fields = array())
    {
        $data = $this->_collection->findOne($query, $fields);
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
     *
     * @param string $id
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
     * @param Object $model
     * @param string $id
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
            CodeGuard::exception("Exception thrown while decoding '$id'", $ex->getCode(), $ex);
        }
    }

    /**
     *
     * @param Object $model
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
     *
     * @param Object $model
     * @param array  $properties
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

    public function readSubDocument($model, $rootId, $property, $id)
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        $data = $this->_collection->findOne(array("_id" => self::mongoID($rootId)), array($property . '.' . $id));
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
     */
    public function write($model, $id, $keyStyle = MongoMapper::ID_IN_KEY, $rootId = '', $property = '')
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($property, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        $data = MongoEncoder::encode($model); // TODO Take into account key style for stripping key out of the model if needs be
        if (empty($rootId)) {
            // We're doing a root level update, only $model, $id are relevant
            $id = $this->update($data, $id, self::ID_IN_KEY, '', '');
        } else {
            if ($keyStyle == self::ID_IN_KEY) {
                CodeGuard::checkNullAndThrow($id, 'id');
                $id = $this->update($data, $id, self::ID_IN_KEY, $rootId, $property);
            } else {
                if (empty($id)) {
                    // TODO would be nice if the encode above gave us the id it generated so we could return it to be consistent. CP 2013-08
                    $this->appendSubDocument($data, $rootId, $property);
                } else {
                    $id = $this->update($data, $id, self::ID_IN_DOC, $rootId, $property);
                }
            }
        }
        return $id;
    }

    public function remove($id)
    {
        CodeGuard::checkTypeAndThrow($id, 'string');
        $result = $this->_collection->remove(
            array('_id' => self::mongoID($id)),
            array('safe' => true)
        );
        return $result['n'];
    }

    public function dropCollection() {
        $this->_collection->drop();
    }

    public function removeSubDocument($rootId, $property, $id)
    {
        CodeGuard::checkTypeAndThrow($rootId, 'string');
        CodeGuard::checkTypeAndThrow($id, 'string');
        $result = $this->_collection->update(
                array('_id' => self::mongoId($rootId)),
                array('$unset' => array($property . '.' . $id => '')),
                array('multiple' => false, 'safe' => true)
        );
        // TODO Have a closer look at $result and throw if things go wrong CP 2013-07

        return $result['ok'] ? $result['n'] : 0;
    }

    public function removeProperty($property)
    {
        CodeGuard::checkTypeAndThrow($property, 'string');
        $result = $this->_collection->update(
            array($property => array('$exists' => true)),
            array('$unset' => array($property => true)),
            array('multiple' => true)
        );
        return $result['ok'] ? $result['n'] : 0;
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
                $mongoid = self::mongoId($id);
                $result = $this->_collection->update(
                    array('_id' => $mongoid),
                    array('$set' => $data),
                    array('upsert' => true, 'multiple' => false, 'safe' => true)
                );
                //$id = isset($result['upserted']) ? $result['upserted'].$id : $id;
                $id = $mongoid->__toString();
            } else {
                CodeGuard::checkNullAndThrow($id, 'id');
                CodeGuard::checkNullAndThrow($property, 'property');
                $subKey = $property . '.' . $id;
                $result = $this->_collection->update(
                    array('_id' => self::mongoId($rootId)),
                    array('$set' => array($subKey => $data)),
                    array('upsert' => false, 'multiple' => false, 'safe' => true)
                );
            }
        } else {
            CodeGuard::checkNullAndThrow($id, 'id');
            $result = $this->_collection->update(
                array('_id' => self::mongoId($rootId)),
                array('$set' => array($property . '$' . $id => $data)),
                array('upsert' => false, 'multiple' => false, 'safe' => true)
            );
        }
        return $id;
    }

}
