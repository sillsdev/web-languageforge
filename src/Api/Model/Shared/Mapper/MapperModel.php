<?php

namespace Api\Model\Shared\Mapper;

use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class MapperModel extends ObjectForEncoding
{
    /**
     * @param MongoMapper $mapper
     * @param string $id
     */
    protected function __construct($mapper, $id = "")
    {
        $this->_mapper = $mapper;
        $now = UniversalTimestamp::now();
        $this->dateModified = $now;
        $this->dateCreated = $now;
        $this->setReadOnlyProp("dateModified");
        $this->setReadOnlyProp("dateCreated");
        CodeGuard::checkTypeAndThrow($id, "string");
        if (!empty($id)) {
            $this->read($id);
        }
    }

    /** @var MongoMapper */
    protected $_mapper;

    /** @var UniversalTimestamp */
    public $dateModified;

    /** @var UniversalTimestamp */
    public $dateCreated;

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

    public function readIfExists($id)
    {
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

    public function readByPropertyArrayContains($property, $value)
    {
        return $this->_mapper->readByPropertyArrayContains($this, $property, $value);
    }

    /**
     * Writes the model to the mongo collection
     * @return string The unique id of the object written
     * @see MongoMapper::write()
     */
    public function write()
    {
        CodeGuard::checkTypeAndThrow($this->id, "Api\Model\Shared\Mapper\Id");
        $now = UniversalTimestamp::now();
        if (!defined("MAPPERMODEL_NO_TIMESTAMP_UPDATE")) {
            $this->dateModified = $now;
        }
        if (Id::isEmpty($this->id)) {
            $this->dateCreated = $now;
        }
        $rearrangeableProperties = $this->getRearrangeableProperties();
        $rearrangeableSubproperties = [];
        foreach ($rearrangeableProperties as $property) {
            $value = $this->$property;
            if (is_a($value, "Api\Model\Shared\Mapper\ArrayOf")) {
                foreach ($value as $item) {
                    if (is_a($item, "Api\Model\Shared\Mapper\ObjectForEncoding")) {
                        foreach ($item->getRearrangeableProperties() as $subProperty) {
                            if (!array_key_exists($property, $rearrangeableSubproperties)) {
                                $rearrangeableSubproperties[$property] = [];
                            }
                            $rearrangeableSubproperties[$property][] = $subProperty;
                        }
                    }
                }
            }
        }
        $this->id->id = $this->_mapper->write(
            $this,
            $this->id->id,
            $rearrangeableProperties,
            $rearrangeableSubproperties
        );

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
