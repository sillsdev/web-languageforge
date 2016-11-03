<?php

namespace Api\Model\Scriptureforge\Sfchecks;

use Api\Model\Shared\Mapper\MongoMapper;

class QuestionModelMongoMapper extends MongoMapper
{
    /**
     * @param string $databaseName
     * @return QuestionModelMongoMapper
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new QuestionModelMongoMapper($databaseName, 'questions');
        }
        return static::$_pool[$databaseName];
    }

    /** @var QuestionModelMongoMapper[] */
    private static $_pool = array();
}
