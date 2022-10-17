<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\MongoMapper;

class ActivityModelMongoMapper extends MongoMapper
{
    /**
     * @param string $databaseName
     * @return ActivityModelMongoMapper
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new ActivityModelMongoMapper($databaseName, "activity");
        }

        return static::$_pool[$databaseName];
    }

    /** @var ActivityModelMongoMapper[] */
    private static $_pool = [];
}
