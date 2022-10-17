<?php

namespace Api\Model\Shared\Mapper;

class MapperListModel
{
    /**
     * @param MongoMapper $mapper
     * @param array $query
     * @param array $fields
     * @param array $sortFields
     * @param int $limit
     * @param int $skip
     */
    protected function __construct($mapper, $query = [], $fields = [], $sortFields = [], $limit = 0, $skip = 0)
    {
        $this->_mapper = $mapper;
        $this->_query = $query;
        $this->_fields = $fields;
        $this->_sortFields = $sortFields;
        $this->_limit = $limit;
        $this->_skip = $skip;
    }

    /** @var int Count of the items returned.  May be less than the total count if a limit is applied */
    public $count;

    /** @var int Total count of items matching the query */
    public $totalCount;

    /** @var array */
    public $entries;

    /** @var MongoMapper */
    protected $_mapper;

    /** @var array */
    protected $_query;

    /** @var array */
    protected $_fields;

    /** @var array */
    protected $_sortFields;

    /** @var int */
    protected $_limit;

    /** @var int */
    protected $_skip;

    public function read()
    {
        $this->_mapper->readList($this, $this->_query, $this->_fields, $this->_sortFields, $this->_limit, $this->_skip);
    }

    /**
     * Developer Note: use of this method assumes that you have redefined $this->entries to be of type MapOf or ArrayOf.
     * e.g. $this->entries = new MapOf(function ($data) use ($projectModel) { return new ActivityModel($projectModel); });
     */
    public function readAsModels()
    {
        $this->_mapper->readListAsModels(
            $this,
            $this->_query,
            $this->_fields,
            $this->_sortFields,
            $this->_limit,
            $this->_skip
        );
    }

    public function readCounts()
    {
        $this->_mapper->readCounts(
            $this,
            $this->_query,
            $this->_fields,
            $this->_sortFields,
            $this->_limit,
            $this->_skip
        );
    }

    public function deleteAll()
    {
        $this->_mapper->dropCollection();
    }

    // TODO Would be nice to deprecate this or at least have it protected not public. Derived models can run their own specific query. CP 2013-11
    public function readByQuery($query, $fields = [], $sortFields = [], $limit = 0)
    {
        $this->_mapper->readList($this, $query, $fields, $sortFields, $limit);
    }
}
