<?php

namespace Api\Library\Shared\Communicate\Sms;

use Api\Model\Mapper\MongoMapper;

class SmsMongoMapper extends MongoMapper
{
    /**
     * @var SmsMongoMapper[]
     */
    private static $_pool = array();

    /**
     * @param string $databaseName
     * @return SmsMongoMapper
     */
    public static function connect($databaseName)
    {
        if (!isset(static::$_pool[$databaseName])) {
            static::$_pool[$databaseName] = new SmsMongoMapper($databaseName, 'sms');
        }

        return static::$_pool[$databaseName];
    }
}
