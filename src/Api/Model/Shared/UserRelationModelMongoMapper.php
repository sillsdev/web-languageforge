<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MongoMapper;

class UserRelationModelMongoMapper extends MongoMapper
{
    public $INDEXES_REQUIRED = [["key" => ["type" => 1]], ["key" => ["userRef" => 1]], ["key" => ["projectRef" => 1]]];

    public static function instance()
    {
        static $instance = null;
        if (null === $instance) {
            $instance = new UserRelationModelMongoMapper(DATABASE, "userrelation");
        }

        return $instance;
    }
}
