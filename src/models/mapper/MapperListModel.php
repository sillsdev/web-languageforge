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
     * 
     * @var int
     */
    protected $_limit;

    /**
     * @param MongoMapper $mapper
     * @param array $query
     * @param array $fields
     * @param array $sortFields
     * @param int $limit
     */
    protected function __construct($mapper, $query = array(), $fields = array(), $sortFields = array(), $limit = 0)
    {
        $this->_mapper = $mapper;
        $this->_query = $query;
        $this->_fields = $fields;
        $this->_sortFields = $sortFields;
        $this->_limit = $limit;
    }

    public function read()
    {
        return $this->_mapper->readList($this, $this->_query, $this->_fields, $this->_sortFields, $this->_limit);
    }

    /**
     * Note: use of this method assumes that you have redefined $this->entries to be of type MapOf or ArrayOf.
     * e.g. $this->entries = new MapOf(function ($data) use ($projectModel) { return new ActivityModel($projectModel); });
     */
    public function readAsModels()
    {
        return $this->_mapper->readListAsModels($this, $this->_query, $this->_fields, $this->_sortFields, $this->_limit);
    }

    // TODO Would be nice to deprecate this or at least have it protected not public. Derived models can run their own specific query. CP 2013-11
    public function readByQuery($query, $fields = array(), $sortFields = array(), $limit = 0)
    {
        return $this->_mapper->readList($this,$query, $fields, $sortFields ,$limit);
    }

}
