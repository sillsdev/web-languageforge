<?php

namespace models\mapper;

class MapperListModel
{
    /**
     * @var int
     */
    public $count;

    /**
     * @var array
     */
    public $entries;

    /**
     * @var MongoMapper
     */
    protected $_mapper;

    /**
     * @var array
     */
    protected $_query;

    /**
     * @var array
     */
    protected $_fields;

    /**
     * @var array
     */
    protected $_sortFields;

    /**
     * @param MongoMapper $mapper
     * @param array $query
     * @param array $fields
     * @param array $sortFields
     */
    protected function __construct($mapper, $query = array(), $fields = array(), $sortFields = array())
    {
        $this->_mapper = $mapper;
        $this->_query = $query;
        $this->_fields = $fields;
        $this->_sortFields = $sortFields;
    }

    public function read()
    {
        return $this->_mapper->readList($this, $this->_query, $this->_fields, $this->_sortFields);
    }

    public function readAsModels()
    {
        return $this->_mapper->readListAsModels($this, $this->_query, $this->_fields, $this->_sortFields);
    }

    // TODO Would be nice to deprecate this or at least have it protected not public. Derived models can run their own specific query. CP 2013-11
    public function readByQuery($query, $fields = array(), $sortFields = array(), $limit = 0)
    {
        return $this->_mapper->readList($this,$query, $fields, $sortFields ,$limit);
    }

}
