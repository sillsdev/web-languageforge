<?php

namespace Api\Model\Mapper;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class MapperModel extends ObjectForEncoding
{
    /** @var MongoMapper */
    protected $_mapper;

    /** @var UniversalTimestamp */
    public $dateModified;

    /** @var UniversalTimestamp */
    public $dateCreated;

    /**
     * @param MongoMapper $mapper
     * @param string $id
     */
    protected function __construct($mapper, $id = '')
    {
        $this->_mapper = $mapper;
        $now = UniversalTimestamp::now();
        $this->dateModified = $now;
        $this->dateCreated = $now;
        $this->setReadOnlyProp('dateModified');
        $this->setReadOnlyProp('dateCreated');
        CodeGuard::checkTypeAndThrow($id, 'string');
        if (!empty($id)) {
            $this->read($id);
        }
    }

    /**
     * Reads the model from the mongo collection
     * @param string $id
     * @see MongoMapper::read()
     * @throws \Exception
     */
    public function read($id)
    {
        if ($this->_mapper->exists($id)) {
            $this->_mapper->read($this, $id);
        } else {
            throw new \Exception(get_called_class() . "($id) doesn't exist");
        }
    }

    public function readIfExists($id) {
        if ($this->_mapper->exists($id)) {
            $this->_mapper->read($this, $id);
            return true;
        } else {
            return false;
        }
    }

    /**
     * @param string $property
     * @param string $value
     * @return boolean
     */
    public function readByProperty($property, $value)
    {
        return $this->_mapper->readByProperty($this, $property, $value);
    }

    /**
     * @param array $properties
     * @return boolean
     */
    public function readByProperties($properties)
    {
        return $this->_mapper->readByProperties($this, $properties);
    }

    /**
     * Writes the model to the mongo collection
     * @return string The unique id of the object written
     * @see MongoMapper::write()
     */
    public function write()
    {
        CodeGuard::checkTypeAndThrow($this->id, 'Api\Model\Mapper\Id');
        $now = UniversalTimestamp::now();
        $this->dateModified = $now;
        if (Id::isEmpty($this->id)) {
            $this->dateCreated = $now;
        }
        $this->id->id = $this->_mapper->write($this, $this->id->id);

        return $this->id->id;
    }

    /**
     * returns true if the Id exists in the collection, false otherwise
     * @param string $id
     * @return bool
     */
    public function exists($id)
    {
        $idExists = $this->_mapper->exists($id);

        return $idExists;
    }

    /**
     * Returns the database name
     * @return string
     */
    public function databaseName()
    {
        return $this->_mapper->databaseName();
    }
}
