<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MongoMapper;

class ProjectModelMongoMapper extends MongoMapper
{
    public $INDEXES_REQUIRED = [
        ['key' => ['projectCode' => 1], 'unique' => true]
    ];

    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new ProjectModelMongoMapper(DATABASE, 'projects');
        }

        return $instance;
    }
}
