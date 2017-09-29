<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\MongoMapper;

class TextModelMongoMapper extends MongoMapper
{
    /**
     * @param string $databaseName
     * @return TextModelMongoMapper
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new TextModelMongoMapper($databaseName, 'texts');
        }
        return static::$_pool[$databaseName];
    }

    /** @var TextModelMongoMapper[] */
    private static $_pool = array();
}
